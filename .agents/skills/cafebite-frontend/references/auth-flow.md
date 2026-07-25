# 09 - Auth Flow

> Best practices from OWASP, JWT.io, and modern SPA authentication.

---

## Sources

- [OWASP - JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [OWASP - Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Auth0 - JWT Introduction](https://auth0.com/learn/json-web-tokens)
- [JWT.io - Introduction](https://jwt.io/introduction)
- [React Router - Protected Routes](https://reactrouter.com/start/declarative/installation)
- [localStorage vs cookies - Security](https://blog.securityevaluators.com/websockets-and-localstorage-30f48ed5fdf4)

---

## Auth Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  User submits credentials                                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  POST /v1/auth/user/verify-password                              │
│  → Backend verifies password                                     │
│  → Generates access token (15min) + refresh token (7d)          │
│  → Sets cookies + returns tokens + user data                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend stores tokens                                          │
│  → localStorage (current project) or HTTP-only cookies (safer)   │
│  → Sets axios default headers                                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Each subsequent request:                                        │
│  → axios interceptor attaches access token in Authorization     │
│  → axios interceptor attaches refresh token in user-data       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  On 401 response:                                                │
│  → Clear tokens                                                  │
│  → Redirect to /login                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current Project Auth Implementation

**Reference: `frontend/src/utils/api.js`**

```javascript
import axios from "axios";

const isProduction = import.meta.env.PROD === true;
const BASE_URL = isProduction 
  ? import.meta.env.VITE_BASE_URL_PROD 
  : import.meta.env.VITE_BASE_URL_LOCAL;

// Public API (no auth) - login, register
export const authApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Authenticated API
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request interceptor - attach tokens
api.interceptors.request.use(
  (config) => {
    const accessToken = window.localStorage.getItem("accessToken");
    const refreshToken = window.localStorage.getItem("refreshToken");
    if (accessToken) {
      config.headers.Authorization = accessToken;
    }
    if (refreshToken) {
      config.headers["user-data"] = refreshToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("refreshToken");
      window.localStorage.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## Token Storage: localStorage vs Cookies

### Current Project: localStorage

[Source: OWASP - Local Storage Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage)

**Pros:**
- Simple, no CSRF concerns
- Easy to read in JavaScript
- Works with cross-origin APIs

**Cons:**
- Vulnerable to XSS (any injected script can read tokens)
- Not accessible to backend cookies

### Safer: HTTP-Only Cookies

[Source: Auth0 - Cookies](https://auth0.com/docs/secure/security-guidance/data-security/token-storage)

**Pros:**
- Not accessible to JavaScript (immune to XSS)
- Automatically sent with requests
- Can be set to `Secure` and `SameSite=Strict`

**Cons:**
- Vulnerable to CSRF (mitigated with `SameSite=Strict` or CSRF tokens)
- Requires CORS configuration

### Best Practice: Hybrid

```
Access Token → HTTP-Only Cookie (XSS-safe)
Refresh Token → HTTP-Only Cookie (XSS-safe, longer expiry)
CSRF Token → Readable by JS (sent in header)
```

---

## Login Flow

**Reference: `frontend/src/components/Authentication/Login.jsx`**

```jsx
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { 
  verifyUserPassword, 
  checkUserSession 
} from "@/service/auth.service";
import { toastSuccess, toastError } from "@/utils/toast-utils";

function LoginPage() {
  const navigate = useNavigate();
  
  // 1. Check if already logged in
  const { data: userData, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: checkUserSession,
    retry: false,
    staleTime: Infinity,
    enabled: !!localStorage.getItem("accessToken"),
  });
  
  // 2. Redirect if already logged in
  useEffect(() => {
    if (userData) {
      navigate("/", { replace: true });
    }
  }, [userData, navigate]);
  
  // 3. Login mutation
  const loginMutation = useMutation({
    mutationFn: verifyUserPassword,
    onSuccess: (response) => {
      const { accessToken, refreshToken, userData: user } = response;
      
      // Store tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userData", JSON.stringify(user));
      
      toastSuccess("Logged in successfully");
      navigate("/", { replace: true });
    },
    onError: (error) => {
      toastError(error?.err?.message || "Login failed");
    },
  });
  
  // 4. Form setup
  const form = useForm({
    defaultValues: { loginId: "", loginType: "EMAIL", password: "" },
  });
  
  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };
  
  // 5. Show loader while checking session
  if (isLoading) {
    return <PilsatingDotesLoader />;
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register("loginId")} placeholder="Email" />
      <Input type="password" {...form.register("password")} />
      <Button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
```

---

## Protected Routes (Private Routes)

**Reference: `frontend/src/common/PrivateRoutes.jsx`**

[Source: React Router - Protected Routes](https://reactrouter.com/start/declarative/installation)

```jsx
import { Navigate, Outlet, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { checkUserSession } from "@/service/auth.service";
import PilsatingDotesLoader from "@/components/ui/loaders/PilsatingDotesLoader";

export function PrivateRoutes() {
  const location = useLocation();
  
  // Check session on mount
  const { data, error, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: checkUserSession,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  
  // Show loader while checking
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PilsatingDotesLoader />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (error || !data) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ from: location }} 
      />
    );
  }
  
  // Render protected children
  return <Outlet />;
}
```

### Usage in App.jsx

```jsx
<Route path="/" element={<PrivateRoutes />}>
  <Route path="" element={<Sidebar />}>
    <Route path="menu-management/*" element={<MenuRoutes />} />
    <Route path="qr-management" element={<QrCodeManagerIndex />} />
    {/* ... */}
  </Route>
</Route>
```

---

## Role-Based Access Control (RBAC)

[Source: OWASP - Access Control](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

### Permissions Context

**Reference: `frontend/src/contexts/PermissionsContext.jsx`**

```jsx
import React, { createContext, useContext, useState } from "react";

const PermissionsContext = createContext(undefined);

export function PermissionsProvider({ children }) {
  const [permissions, setPermissions] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const updatePermissions = (userData) => {
    setPermissions(userData);
    setIsSuperAdmin(
      userData?.unique_id === import.meta.env.VITE_BASE_SUPER_ADMIN_ID
    );
  };
  
  return (
    <PermissionsContext.Provider value={{ 
      permissions, 
      isSuperAdmin, 
      updatePermissions 
    }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within PermissionsProvider");
  }
  return context;
}
```

### Role-Based Component

```jsx
import { usePermissions } from "@/contexts/PermissionsContext";

function AdminButton() {
  const { isSuperAdmin } = usePermissions();
  
  if (!isSuperAdmin) return null;
  
  return <Button>Delete User</Button>;
}
```

### Role-Based Route

```jsx
import { Navigate, Outlet } from "react-router";
import { usePermissions } from "@/contexts/PermissionsContext";

export function AdminOnlyRoute() {
  const { isSuperAdmin } = usePermissions();
  
  if (!isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <Outlet />;
}

// Usage
<Route element={<AdminOnlyRoute />}>
  <Route path="admin/users" element={<UsersPage />} />
</Route>
```

### Permission Check (Granular)

```jsx
function CategoryActions({ category }) {
  const { permissions, hasPermission } = usePermissions();
  
  if (!hasPermission('category:edit')) return null;
  if (!hasPermission('category:delete')) return null;
  
  return (
    <div>
      <Button onClick={() => handleEdit(category)}>Edit</Button>
      <Button onClick={() => handleDelete(category)}>Delete</Button>
    </div>
  );
}
```

---

## Logout Flow

```jsx
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "@/service/auth.service";

function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      // Clear all local state regardless of success/failure
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      
      // Clear all React Query cache
      queryClient.clear();
      
      // Redirect to login
      navigate("/login", { replace: true });
    },
  });
}

// Usage
function LogoutButton() {
  const logout = useLogout();
  return <Button onClick={() => logout.mutate()}>Logout</Button>;
}
```

---

## Session Management

### Session Check on App Load

```jsx
// main.jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Session Refresh

[Source: Auth0 - Refresh Tokens](https://auth0.com/docs/secure/security-guidance/token-best-practices)

```javascript
// Axios interceptor for auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and haven't tried refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        
        // Retry original request
        originalRequest.headers.Authorization = accessToken;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## Security Best Practices

[Source: OWASP - Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

### 1. Never Store Passwords in JWT

```javascript
// ❌ WRONG
const userData = { email, password };

// ✅ CORRECT
const userData = { email };  // No password
```

### 2. Use Short-Lived Access Tokens

| Token | Expiry | Storage |
|-------|--------|---------|
| Access | 15 min | Memory or localStorage |
| Refresh | 7 days | HTTP-only cookie or localStorage |

### 3. Validate Token Before Sending

```javascript
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
```

### 4. Use HTTPS in Production

```javascript
// In production, all API calls must use HTTPS
const BASE_URL = isProduction 
  ? "https://api.cafebite.com"  // HTTPS
  : "http://localhost:3002";   // HTTP for dev
```

### 5. Prevent XSS

```jsx
// ❌ WRONG - Vulnerable to XSS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ CORRECT - React escapes by default
<div>{userInput}</div>
```

### 6. Implement Rate Limiting on Login

```javascript
// Backend should rate limit /auth/login
// Frontend: disable button after 3 failed attempts
const [attempts, setAttempts] = useState(0);

const onSubmit = (data) => {
  if (attempts >= 3) {
    toastError("Too many attempts. Try again later.");
    return;
  }
  loginMutation.mutate(data, {
    onError: () => setAttempts((a) => a + 1),
  });
};
```

---

## Public Routes (No Auth)

[Source: React Router - Layout Routes](https://reactrouter.com/start/declarative/routing#layout-routes)

**Reference: `frontend/src/App.jsx:67-72`**

```jsx
// Public routes (e.g., customer menu)
{isPublicRoute && (
  <Routes>
    <Route path="/menu/:restaurantId/:tableId" element={<CustomerMenuIndex />} />
    <Route path="/menu/*" element={<p>No Access</p>} />
  </Routes>
)}
```

```jsx
function App() {
  const location = useLocation();
  const isPublic = location.pathname.startsWith("/menu/");
  
  if (isPublic) {
    return (
      <Routes>
        <Route path="/menu/:restaurantId/:tableId" element={<CustomerMenu />} />
      </Routes>
    );
  }
  
  // ... authenticated routes
}
```

---

## Auth Pages

| Page | Path | Auth |
|------|------|------|
| Login | `/login` | Public |
| Register | `/register-user` | Public |
| Reset Password | `/reset-password` | Public |
| Dashboard | `/` | Private |
| Settings | `/profile-management` | Private |
| Admin Panel | `/admin/*` | Admin only |

---

## Environment Variables

```env
# .env (development)
VITE_BASE_URL_LOCAL=http://localhost:3002
VITE_SOCKET_URL_LOCAL=http://localhost:3002
VITE_BASE_SUPER_ADMIN_ID=admin-uuid-here

# .env.production
VITE_BASE_URL_PROD=https://api.cafebite.com
VITE_SOCKET_URL_PROD=https://api.cafebite.com
VITE_BASE_SUPER_ADMIN_ID=admin-uuid-here
```

**Rules:**
- All env vars start with `VITE_` (Vite requirement)
- Never commit secrets to `.env` (use `.env.example` for template)
- Different env files for dev/staging/prod

---

## Current Project vs Best Practice

| Aspect | Current | Best Practice | Action |
|--------|---------|---------------|--------|
| **Token storage** | localStorage | HTTP-only cookies (safer) | Acceptable for SPA |
| **Auto-refresh** | Not implemented | Refresh token rotation | Add when needed |
| **Session check** | On private route | On app load | Add on app load |
| **Role check** | isSuperAdmin only | Granular permissions | Add granular perms |
| **CSRF** | Not applicable (no cookies) | Required if using cookies | Not needed now |
| **HTTPS** | Production env | Same | ✅ Correct |
| **XSS prevention** | React default | Same | ✅ Correct |
| **Token expiry** | 24h access, 30d refresh | 15m access, 7d refresh | Update backend |

---

## Best Practice Checklist

- [ ] Tokens stored in localStorage or HTTP-only cookies
- [ ] Access token has short expiry (15 min)
- [ ] Refresh token has longer expiry (7 days)
- [ ] Axios interceptor attaches tokens automatically
- [ ] 401 response clears tokens and redirects to login
- [ ] Session check on protected route mount
- [ ] Session check on app load
- [ ] Role-based access control via context
- [ ] Logout clears all local state and query cache
- [ ] HTTPS in production
- [ ] No `dangerouslySetInnerHTML` with user input
- [ ] No passwords in JWT
- [ ] Rate limiting on login (backend)
- [ ] Password validation (min length, complexity)
- [ ] Auto-logout on token expiry
- [ ] CSRF protection if using cookies
- [ ] All auth pages use Shadcn components
- [ ] Loading states during auth operations
- [ ] Error toasts with exact API messages
- [ ] Redirect to original page after login (`state={{ from }}`)
