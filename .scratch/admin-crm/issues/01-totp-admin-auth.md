# 01 — Admin TOTP Authentication & Route Protection

**What to build:**
End-to-end TOTP authentication flow. Users navigate to `/admin/login` and enter a 6-digit Google Authenticator code. The backend verifies the 6-digit PIN against `ADMIN_TOTP_SECRET` using RFC 6238 TOTP algorithm, returns an `adminAccessToken` JWT upon success, and stores it in frontend storage. Frontend `AdminPrivateRoutes` guard blocks unauthorized access to `/admin/*` pages, and backend `adminAuthMiddleware` protects all `/v1/admin/*` API endpoints.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Unauthenticated requests to `/admin/*` routes redirect to `/admin/login`.
- [ ] Direct API requests to `/v1/admin/*` without a valid `adminAccessToken` return HTTP 401 Unauthorized.
- [ ] `/admin/login` displays a clean 6-digit PIN entry interface.
- [ ] Entering an invalid 6-digit TOTP code displays an error toast notification.
- [ ] Entering a valid 6-digit TOTP code returns `adminAccessToken` JWT and navigates user to `/admin/leads`.
- [ ] Page refreshes maintain admin session as long as JWT remains valid.
- [ ] Logout action clears `adminAccessToken` and redirects to `/admin/login`.
