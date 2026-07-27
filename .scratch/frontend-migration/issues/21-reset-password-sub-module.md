# 21 — ResetPassword sub-module

**What to build:** The ResetPassword feature is extracted into a self-contained sub-module under `Authentication/ResetPassword/` with its own hooks, validation, and constants — matching the Menu sub-module pattern. The password reset page at `/reset-password` continues to work identically (token validation, password + confirmPassword form, redirect to `/login` on success).

Creates `ResetPassword/ResetPasswordIndex.jsx` (renamed from `ResetPassword.jsx`), `ResetPassword/hooks/useResetPasswordData.js` (from `usePasswordResetMutation.js` + inline `validateResetToken` query), `ResetPassword/validation/resetPassword.schema.js` (from `auth.schema.js` — passwordResetSchema), `ResetPassword/constants/resetPassword.constants.js` (from `auth.constants.js` — passwordResetDefaultValues, authQueryKeys.PASSWORD_RESET). Extracts the inline `FullPageLoader` to `ResetPassword/components/FullPageLoader.jsx`. Updates `App.jsx` to point `/reset-password` route to `ResetPasswordIndex`. Deletes old `ResetPassword.jsx`.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Create `Authentication/ResetPassword/ResetPasswordIndex.jsx` — renamed from `ResetPassword.jsx` (no functional changes)
- [ ] Create `Authentication/ResetPassword/hooks/useResetPasswordData.js` — `usePasswordResetMutation()` from `usePasswordResetMutation.js` + `useValidateResetToken()` query hook extracted inline
- [ ] Create `Authentication/ResetPassword/validation/resetPassword.schema.js` — `passwordResetSchema`
- [ ] Create `Authentication/ResetPassword/constants/resetPassword.constants.js` — `passwordResetDefaultValues`, `authQueryKeys.PASSWORD_RESET`
- [ ] Create `Authentication/ResetPassword/components/FullPageLoader.jsx` — extracted from inline component in old `ResetPassword.jsx`
- [ ] Update `App.jsx` `/reset-password` route import to point to `@/components/Authentication/ResetPassword/ResetPasswordIndex`
- [ ] Delete old `ResetPassword.jsx` from `Authentication/`
- [ ] Verify password reset page loads with valid token
- [ ] Verify invalid/expired token redirects to `/login`
- [ ] Verify password + confirmPassword validation works
- [ ] Verify successful reset redirects to `/login` with success toast
- [ ] Verify session check redirects to `/` if already logged in