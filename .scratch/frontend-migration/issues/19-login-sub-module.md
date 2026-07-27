# 19 — Login sub-module

**What to build:** The Login feature is extracted into a self-contained sub-module under `Authentication/Login/` with its own hooks, validation, and constants — matching the Menu sub-module pattern (like Categories, MenuItems). The login page at `/login` continues to work identically.

Creates `Login/LoginIndex.jsx` (extracted from `AuthenticationIndex.jsx` login-specific code), `Login/hooks/useLoginData.js` (from `useLoginMutations.js` — password + OTP mutations only), `Login/validation/login.schema.js` (from `auth.schema.js` — loginIdSchema, passwordLoginSchema, otpLoginSchema), `Login/constants/login.constants.js` (from `auth.constants.js` — loginDefaultValues, loginIdDisplayMap). Moves `LoginWithPassword.jsx` and `LoginWithOTP.jsx` into `Login/components/`. Updates `App.jsx` to point `/login` route to `Login/LoginIndex`. `AuthenticationIndex.jsx` is replaced by `LoginIndex.jsx`.

**Note:** `loginTypeOptions` stays at root `auth.constants.js` (still shared if needed elsewhere). `useAuthSession` stays at root `Authentication/hooks/` (shared by ResetPassword).

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Create `Authentication/Login/LoginIndex.jsx` — extracted from `AuthenticationIndex.jsx` (login page with password/OTP toggle, session check redirect, "Create Account" link)
- [ ] Create `Authentication/Login/hooks/useLoginData.js` — `usePasswordLoginMutation()`, `useOtpLoginMutation()`, `useSendOtpMutation()`, `useRequestPasswordResetMutation()` extracted from `useLoginMutations.js`
- [ ] Create `Authentication/Login/validation/login.schema.js` — `loginIdSchema`, `passwordLoginSchema`, `otpLoginSchema`, `loginSchemas` object
- [ ] Create `Authentication/Login/constants/login.constants.js` — `loginDefaultValues`, `loginIdDisplayMap`
- [ ] Move `LoginWithPassword.jsx` → `Login/components/LoginWithPassword.jsx`, update imports to use `./hooks/useLoginData` and `./constants/login.constants`
- [ ] Move `LoginWithOTP.jsx` → `Login/components/LoginWithOTP.jsx`, update imports to use `./hooks/useLoginData`
- [ ] Update `App.jsx` `/login` route import to point to `@/components/Authentication/Login/LoginIndex`
- [ ] Remove old `AuthenticationIndex.jsx` (replaced by `LoginIndex.jsx`)
- [ ] Verify login with password works end-to-end
- [ ] Verify login with OTP works end-to-end
- [ ] Verify "Forgot Password?" triggers reset link toast
- [ ] Verify "Create Account" link navigates to `/register-user`
- [ ] Verify session check redirects to `/` if already logged in