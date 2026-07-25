# 06 — Migrate Authentication module

**What to build:** The Authentication module conforms to the cafebite-frontend standard. All validation is zod-only (yup removed), localStorage access is centralized through the auth interceptor, useEffect-based redirects are replaced with route guards, and shared schemas are extracted for reuse.

**Blocked by:** 01 — Fix critical runtime bugs, 02 — Remove redundant dependencies

**Status:** ready-for-agent

- [ ] Create AuthenticationIndex.jsx as the module entry point (Login.jsx is the de-facto entry currently)
- [ ] Move Registration/, components/ (LoginIdVerifier, LoginWithOTP, LoginWithPassword) into components/ subdirectory
- [ ] Create hooks/ — extract auth-related hooks (useAuth, useLogin, useRegistration, usePasswordReset)
- [ ] Create constants/auth.constants.js — move constants from utils.js (query keys, labels, options)
- [ ] Create validation/ — move schema.js here, rewrite all yup schemas as zod, fix PASSWAORD_RESET typo
- [ ] Centralize localStorage access — move token storage from LoginWithOTP/LoginWithPassword/SignIn into auth.service.js or a useAuth hook
- [ ] Replace useEffect-based redirects with route guards/loaders (Login.jsx:63, SignIn.jsx:74, ResetPassword.jsx:104-108, Registration.jsx:110)
- [ ] Extract shared schemas (personal info, cafe info, location, contact) to common/validation/ for reuse by ProfileManagement
- [ ] Remove commented-out LoginIdVerifier block from Login.jsx
- [ ] Fix duplicate socialFacebook field binding in Contact.jsx (third field should be socialTwitter)
- [ ] Verify login (password + OTP), registration (4-step wizard), and password reset all work correctly
- [ ] Verify auth flow is secure — no race conditions on redirect
