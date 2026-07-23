import * as authService from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

export const checkUserExists = asyncHandler(async (req, res) => {
    const { loginId } = req.body;
    await authService.checkUserExists(loginId);
    return res.status(200).json({ code: 'USER_FOUND', message: 'User account exists.' });
});

export const checkUserPassword = asyncHandler(async (req, res) => {
    const { loginId, loginType, password } = req.body;

    if (!loginId || !loginType || !password) {
        return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Login identifier, method, and password are required.' });
    }

    const result = await authService.fetchUserByLoginId(loginId);
    const hashedPassword = result[0].password;

    await authService.checkPassword(password, hashedPassword);

    const sessionId = await authService.createUserSession({ ...result[0], loginId, loginType }, req);

    if (!sessionId) {
        return res.status(500).json({ code: 'SESSION_CREATION_FAILED', message: 'Unable to create a user session at this time.' });
    }

    res.cookie('accessToken', sessionId.accessToken, {
        ...authService.COOKIE_OPTIONS,
        maxAge: 1000 * 60 * 60 * 24,
    });

    res.cookie('refreshToken', sessionId.refreshToken, {
        ...authService.COOKIE_OPTIONS,
        maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.status(200).json({ code: 'AUTH_SUCCESS', message: 'Password verified and session created successfully.', userData: result[0], sessionId });
});

export const sendOtp = asyncHandler(async (req, res) => {
    const { loginId: identifier, loginType: method } = req.body;

    if (!identifier || !method) {
        return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Both login identifier and login method are required.' });
    }

    await authService.fetchUserByLoginId(identifier);

    const otp = authService.generateOtp();
    const otpSessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await authService.createOtp(otpSessionId, otp, expiresAt, method, identifier);
    await authService.dispatchOtp(identifier, method, otpSessionId, otp);

    res.cookie('otp_session_id', otpSessionId, {
        ...authService.COOKIE_OPTIONS,
        maxAge: 5 * 60 * 1000,
    });

    return res.status(200).json({ code: 'OTP_SENT', message: 'One-time password sent successfully.' });
});

export const validateOtp = asyncHandler(async (req, res) => {
    const { OTP } = req.body;
    const otpSessionId = req.cookies?.otp_session_id;

    if (!otpSessionId || !OTP) {
        return res.status(400).json({ code: 'INVALID_REQUEST', message: 'OTP and session identifier are required.' });
    }

    const otpResults = await authService.validateOtp(otpSessionId, OTP);
    const userResults = await authService.fetchUserByLoginId(otpResults[0].login_id);

    const sessionId = await authService.createUserSession({ ...userResults[0], loginId: otpResults[0].login_id, loginType: otpResults[0].login_type }, req);

    if (!sessionId) {
        return res.status(500).json({ code: 'SESSION_CREATION_FAILED', message: 'Failed to create a user session.' });
    }

    res.cookie('accessToken', sessionId.accessToken, {
        ...authService.COOKIE_OPTIONS,
        maxAge: 1000 * 60 * 60 * 24,
    });

    res.cookie('refreshToken', sessionId.refreshToken, {
        ...authService.COOKIE_OPTIONS,
        maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.clearCookie('otp_session_id');

    return res.status(200).json({
        code: 'OTP_VERIFIED',
        message: 'OTP verified and session created successfully.',
        sessionId,
        userData: userResults[0],
    });
});

export const initiatePasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Email is required for password reset.' });
    }

    await authService.initiatePasswordReset(email);
    return res.status(200).json({ code: 'RESET_EMAIL_SENT', message: 'A password reset link has been sent to your email address.' });
});

export const processPasswordReset = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Both reset token and new password are required.' });
    }

    await authService.processPasswordReset(token, newPassword);
    return res.status(200).json({ code: 'PASSWORD_RESET_SUCCESS', message: 'Your password has been reset successfully.' });
});

export const checkPasswordResetToken = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({ code: 'INVALID_REQUEST', message: 'A reset token is required.' });
    }

    await authService.checkPasswordResetToken(token);
    return res.status(200).json({ code: 'VALID_TOKEN', message: 'The reset token is valid.' });
});

export const fetchActiveSession = asyncHandler(async (req, res) => {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const refreshToken = req.headers['user-data'];
    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const unique_id = decodedRefresh?.userDetails?.unique_id;

    if (!refreshToken || !unique_id) {
        return res.status(402).json({ code: 'UNAUTHORIZED', message: 'Missing authentication tokens or user identifier.' });
    }

    await authService.fetchActiveSession(unique_id, userAgent, refreshToken);
    return res.status(200).json({ code: 'AUTHORIZED', message: 'Active session confirmed.' });
});

export const logout = asyncHandler(async (req, res) => {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const unique_id = req.user?.unique_id;

    if (!unique_id) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
    }

    const result = await authService.invalidateSessions(unique_id, userAgent);

    if (result.affectedRows > 0) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).json({ code: 'LOGOUT_SUCCESS', message: 'You have been logged out successfully.' });
    } else {
        return res.status(400).json({ code: 'LOGOUT_FAILED', message: 'Logout failed. Please try again.' });
    }
});
