# 20 — Registration sub-module

**What to build:** The Registration feature is extracted into a self-contained sub-module under `Authentication/Registration/` with its own hooks, validation, and constants — matching the Menu sub-module pattern. The registration page at `/register-user` continues to work identically (multi-step wizard with 4 steps: Account, Basic Info, Location, Contact).

Creates `Registration/RegistrationIndex.jsx` (renamed from `Registration.jsx`), `Registration/hooks/useRegistrationData.js` (from `useRegisterMutation.js`), `Registration/validation/registration.schema.js` (from `auth.schema.js` — 4 step schemas + registerSchemas object), `Registration/constants/registration.constants.js` (from `auth.constants.js` — registerFormDefaultValues, stepFieldMap, getStepIcon, getStepLabel). Moves step components (`OwnerInfo.jsx`, `CafeInfo.jsx`, `Location.jsx`, `Contact.jsx`) into `Registration/components/RegistrationForm/`. Updates `App.jsx` to point `/register-user` route to `RegistrationIndex`. Deletes old `Registration.jsx`.

**Note:** `authQueryKeys` for COUNTRY/STATE/CITY/CURRENCY used by `Location.jsx` move to `registration.constants.js`.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Create `Authentication/Registration/RegistrationIndex.jsx` — renamed from `Registration.jsx` (no functional changes)
- [ ] Create `Authentication/Registration/hooks/useRegistrationData.js` — `useRegisterMutation()` from `useRegisterMutation.js`
- [ ] Create `Authentication/Registration/validation/registration.schema.js` — `registerStepOneSchema`, `registerStepTwoSchema`, `registerStepThreeSchema`, `registerStepFourSchema`, `registerSchemas` object
- [ ] Create `Authentication/Registration/constants/registration.constants.js` — `registerFormDefaultValues`, `stepFieldMap`, `getStepIcon`, `getStepLabel`, `authQueryKeys` (COUNTRY, STATE, CITY, CURRENCY)
- [ ] Move `OwnerInfo.jsx` → `Registration/components/RegistrationForm/OwnerInfo.jsx`, update imports
- [ ] Move `CafeInfo.jsx` → `Registration/components/RegistrationForm/CafeInfo.jsx`, update imports
- [ ] Move `Location.jsx` → `Registration/components/RegistrationForm/Location.jsx`, update imports to use `../constants/registration.constants`
- [ ] Move `Contact.jsx` → `Registration/components/RegistrationForm/Contact.jsx`, update imports
- [ ] Update `App.jsx` `/register-user` route import to point to `@/components/Authentication/Registration/RegistrationIndex`
- [ ] Delete old `Registration.jsx` from `Authentication/components/Registration/`
- [ ] Verify 4-step registration wizard works end-to-end
- [ ] Verify step validation works (can't advance with invalid fields)
- [ ] Verify country/state/city cascading dropdowns load correctly
- [ ] Verify logo upload works
- [ ] Verify registration completes and redirects to `/login`