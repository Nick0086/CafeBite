# 07 - Authentication

> JWT dual-token flow, session management, cookie handling, and auth patterns.

---

## Auth Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  LOGIN FLOW                                                     │
│                                                                 │
│  Client → POST /v1/auth/user/verify-password                   │
│       → bcrypt.compare(password, hashedPassword)                │
│       → Generate access token (24h) + refresh token (30d)       │
│       → Create session in client_sessions table                 │
│       → Set cookies: accessToken + refreshToken                 │
│       → Return tokens + userData                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  REQUEST FLOW (Protected Route)                                 │
│                                                                 │
│  Client → GET /v1/category (with cookies)                      │
│       → authMiddleware reads Authorization header               │
│       → Verify access token → decode → set req.user → next()   │
│       → If expired → read user-data header (refresh token)      │
│       → Verify refresh token in DB → generate new access token  │
│       → Set new access token cookie → next()                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Token Types

| Token | Expiry | Storage | Purpose |
|-------|--------|---------|---------|
| Access Token | 24h (`ACCESS_TOKEN_EXPIRY`) | Cookie + Header | API authentication |
| Refresh Token | 30d (`REFRESH_TOKEN_EXPIRY`) | Cookie + Header + DB | Auto-refresh access token |

---

## Cookie Options

```javascript
export const COOKIE_OPTIONS = {
    httpOnly: true,                                          // Not accessible via JS
    secure: process.env.NODE_ENV === 'DEV' ? false : true,  // HTTPS in production
    sameSite: process.env.NODE_ENV === 'DEV' ? true : 'None', // Cross-site in production
    path: '/',
};
```

---

## Login Flow

### Step 1: Check User Exists

```javascript
// POST /v1/auth/user/check
// Body: { "loginId": "john@example.com" }

export const checkUserExists = asyncHandler(async (req, res) => {
    const { loginId } = req.body;
    await authService.checkUserExists(loginId);
    return res.status(200).json({ code: 'USER_FOUND', message: 'User account exists.' });
});
```

### Step 2: Verify Password

```javascript
// POST /v1/auth/user/verify-password
// Body: { "loginId": "john@example.com", "loginType": "EMAIL", "password": "secret" }

export const checkUserPassword = asyncHandler(async (req, res) => {
    const { loginId, loginType, password } = req.body;

    const result = await authService.fetchUserByLoginId(loginId);
    const hashedPassword = result[0].password;

    await authService.checkPassword(password, hashedPassword);

    const sessionId = await authService.createUserSession({ ...result[0], loginId, loginType }, req);

    res.cookie('accessToken', sessionId.accessToken, {
        ...authService.COOKIE_OPTIONS,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    res.cookie('refreshToken', sessionId.refreshToken, {
        ...authService.COOKIE_OPTIONS,
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });

    return res.status(200).json({
        code: 'AUTH_SUCCESS',
        message: 'Password verified and session created successfully.',
        userData: result[0],
        sessionId
    });
});
```

### Service: Create Session

```javascript
export const createUserSession = async (userData, req) => {
    const sessionId = uuidv4();
    const userAgent = req?.headers?.['user-agent'] || 'Unknown';
    const ipAddress = req?.ip || 'Unknown';
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const { unique_id, loginId, loginType } = userData;

    const refreshToken = jwt.sign(
        { userDetails: { ...userData, password: null }, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    const accessToken = jwt.sign(
        { userDetails: { ...userData, password: null }, type: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    // Revoke previous sessions for this user agent
    await authRepository.updateSessionsRevoked(unique_id, userAgent);

    // Create new session
    await createSession(sessionId, unique_id, userAgent, loginId, loginType, ipAddress, expiresAt, refreshToken);

    return { sessionId, refreshToken, accessToken };
};
```

---

## authMiddleware Flow

```javascript
export const authMiddleware = async (req, res, next) => {
    const accessToken = req.headers['authorization'];
    const refreshToken = req.headers['user-data'];

    // No tokens
    if (!accessToken && !refreshToken) {
        clearAuthCookies(res);
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'No tokens provided' });
    }

    try {
        // Try access token
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.user = decoded.userDetails;
        return next();
    } catch (accessTokenError) {
        // Access token expired or invalid
        if (accessTokenError.name === 'TokenExpiredError' || accessTokenError.name === 'JsonWebTokenError') {

            // No refresh token
            if (!refreshToken) {
                clearAuthCookies(res);
                return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Access token expired, no refresh token' });
            }

            try {
                // Verify refresh token
                const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);

                // Check session in DB
                const sessionSql = `SELECT * FROM client_sessions WHERE refresh_token = ? AND is_revoke = 0 AND expires_at > NOW()`;
                const sessionResult = await query(sessionSql, [refreshToken]);

                if (sessionResult.length === 0) {
                    clearAuthCookies(res);
                    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' });
                }

                // Generate new access token
                const newAccessToken = jwt.sign(
                    { userDetails: decodedRefresh.userDetails, type: 'access' },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
                );

                // Set new access token cookie
                res.cookie('accessToken', newAccessToken, {
                    ...COOKIE_OPTIONS,
                    maxAge: 1000 * 60 * 60 * 24,
                });

                req.user = decodedRefresh.userDetails;
                return next();
            } catch (refreshTokenError) {
                clearAuthCookies(res);
                return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' });
            }
        }
    }
};
```

---

## Session Management

### Database Schema

```sql
CREATE TABLE client_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id CHAR(36) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    user_agent TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    login_type VARCHAR(45) NOT NULL,
    login_id VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    refresh_token TEXT NOT NULL,
    is_revoke INT DEFAULT 0,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id)
);
```

### Revoke Sessions

```javascript
export const invalidateSessions = async (userId, userAgent) => {
    return await authRepository.updateSessionsRevoked(userId, userAgent);
};

// Repository
export const updateSessionsRevoked = async (userId, userAgent, connection = null) => {
    const sql = `UPDATE client_sessions SET is_revoke = ? WHERE client_id = ? AND user_agent = ?`;
    return await query(sql, [1, userId, userAgent], connection);
};
```

### Check Active Session

```javascript
// GET /v1/auth/session/active
export const fetchActiveSession = asyncHandler(async (req, res) => {
    const refreshToken = req.headers['user-data'];
    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const unique_id = decodedRefresh?.userDetails?.unique_id;

    await authService.fetchActiveSession(unique_id, userAgent, refreshToken);
    return res.status(200).json({ code: 'AUTHORIZED', message: 'Active session confirmed.' });
});
```

---

## OTP Flow

### Send OTP

```javascript
// POST /v1/auth/user/send-otp
// Body: { "loginId": "john@example.com", "loginType": "EMAIL" }

export const sendOtp = asyncHandler(async (req, res) => {
    const { loginId: identifier, loginType: method } = req.body;

    await authService.fetchUserByLoginId(identifier);

    const otp = authService.generateOtp();
    const otpSessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await authService.createOtp(otpSessionId, otp, expiresAt, method, identifier);
    await authService.dispatchOtp(identifier, method, otpSessionId, otp);

    res.cookie('otp_session_id', otpSessionId, {
        ...authService.COOKIE_OPTIONS,
        maxAge: 5 * 60 * 1000,
    });

    return res.status(200).json({ code: 'OTP_SENT', message: 'OTP sent successfully.' });
});
```

### Verify OTP

```javascript
// POST /v1/auth/user/verify-otp
// Body: { "OTP": "123456" }
// Cookie: otp_session_id

export const validateOtp = asyncHandler(async (req, res) => {
    const { OTP } = req.body;
    const otpSessionId = req.cookies?.otp_session_id;

    const otpResults = await authService.validateOtp(otpSessionId, OTP);
    const userResults = await authService.fetchUserByLoginId(otpResults[0].login_id);

    const sessionId = await authService.createUserSession({ ...userResults[0] }, req);

    res.cookie('accessToken', sessionId.accessToken, { ...COOKIE_OPTIONS, maxAge: 1000 * 60 * 60 * 24 });
    res.cookie('refreshToken', sessionId.refreshToken, { ...COOKIE_OPTIONS, maxAge: 1000 * 60 * 60 * 24 * 30 });
    res.clearCookie('otp_session_id');

    return res.status(200).json({ code: 'OTP_VERIFIED', message: 'OTP verified.', sessionId });
});
```

---

## Password Reset Flow

### Request Reset

```javascript
// GET /v1/auth/password/forgot/:email

export const initiatePasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.params;
    await authService.initiatePasswordReset(email);
    return res.status(200).json({ code: 'RESET_EMAIL_SENT', message: 'Reset link sent.' });
});
```

### Process Reset

```javascript
// POST /v1/auth/password/reset
// Body: { "token": "uuid", "newPassword": "newsecret" }

export const processPasswordReset = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    await authService.processPasswordReset(token, newPassword);
    return res.status(200).json({ code: 'PASSWORD_RESET_SUCCESS', message: 'Password reset.' });
});
```

---

## Logout

```javascript
// GET /v1/auth/session/logout

export const logout = asyncHandler(async (req, res) => {
    const unique_id = req.user?.unique_id;
    const result = await authService.invalidateSessions(unique_id, userAgent);

    if (result.affectedRows > 0) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).json({ code: 'LOGOUT_SUCCESS', message: 'Logged out.' });
    }
    return res.status(400).json({ code: 'LOGOUT_FAILED', message: 'Logout failed.' });
});
```

---

## JWT Payload Structure

### Access Token

```javascript
{
    userDetails: {
        unique_id: "CLI_1234567890",
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        mobile: "9876543210",
        password: null  // explicitly null
    },
    type: 'access',
    iat: 1234567890,
    exp: 1234654290
}
```

### Refresh Token

```javascript
{
    userDetails: {
        unique_id: "CLI_1234567890",
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        mobile: "9876543210",
        password: null
    },
    type: 'refresh',
    iat: 1234567890,
    exp: 1237160290
}
```

---

## Environment Variables

```env
JWT_SECRET=your-secret-key
ACCESS_TOKEN_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=30d
NODE_ENV=DEV  # or production
```

---

## Security Notes

1. **Never store passwords in JWT** - always set `password: null`
2. **Revoke old sessions** on new login for same user agent
3. **Clear cookies** on auth failure
4. **Use httpOnly cookies** - not accessible via JavaScript
5. **Use secure flag** in production (HTTPS only)
6. **Use sameSite: 'None'** for cross-site cookies in production
7. **OTP expires in 5 minutes** - short-lived
8. **Password reset tokens expire in 10 minutes**
