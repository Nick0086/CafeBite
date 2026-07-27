# 22 — Auth root shared files cleanup

**What to build:** After tickets 19–21 extract Login, Registration, and ResetPassword into their own sub-modules, remove the duplicated entries from the root-level shared files. Only truly shared code remains at the `Authentication/` root: `useAuthSession.js` (used by both Login and ResetPassword) and a minimal `auth.constants.js` containing only `authQueryKeys.LOGIN` (if still needed).

Removes from `auth.constants.js`: `loginDefaultValues`, `registerFormDefaultValues`, `passwordResetDefaultValues`, `stepFieldMap`, `getStepIcon`, `getStepLabel`, `loginIdDisplayMap`. Removes from `auth.schema.js`: all schemas (they now live in each sub-module). Deletes old root hook files: `useLoginMutations.js`, `useRegisterMutation.js`, `usePasswordResetMutation.js`. Verifies all three auth flows still work with no broken imports.

**Blocked by:** 19 — Login sub-module, 20 — Registration sub-module, 21 — ResetPassword sub-module

**Status:** ready-for-agent

- [ ] Remove duplicated entries from `Authentication/constants/auth.constants.js` — keep only `authQueryKeys` (trimmed to `LOGIN`) and `loginTypeOptions`
- [ ] Remove all schemas from `Authentication/validation/auth.schema.js` — file may be deleted if empty
- [ ] Delete `Authentication/hooks/useLoginMutations.js` (moved to `Login/hooks/useLoginData.js`)
- [ ] Delete `Authentication/hooks/useRegisterMutation.js` (moved to `Registration/hooks/useRegistrationData.js`)
- [ ] Delete `Authentication/hooks/usePasswordResetMutation.js` (moved to `ResetPassword/hooks/useResetPasswordData.js`)
- [ ] Verify `useAuthSession.js` at root has no broken imports
- [ ] Verify `/login` page loads and works end-to-end
- [ ] Verify `/register-user` page loads and works end-to-end
- [ ] Verify `/reset-password` page loads and works end-to-end