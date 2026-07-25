# 02 — Remove redundant dependencies

**What to build:** The bundle shrinks by ~350KB and the codebase has one clear choice per concern — one date library, one validation library, one animation library, one toast system, and no confusingly-named duplicate directories.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Remove moment dependency, replace all usage with date-fns (order-management-context.jsx)
- [ ] Remove yup dependency, rewrite all yup schemas as zod schemas (Authentication/schema.js, ProfileManagement/schema.js, SignIn.jsx, ResetPassword.jsx)
- [ ] Remove motion package (framer-motion is what the codebase actually uses)
- [ ] Remove shadcn Toaster from App.jsx (react-toastify via toast-utils.js is the established system)
- [ ] Rename services/ directory to lib/ or utils/ to eliminate confusion with service/ (ImageCacheService.js is client-side caching, not an API service)
- [ ] Remove "use client" directive from use-toast.js (Next.js-ism, irrelevant in Vite)
- [ ] Verify app builds and all existing functionality works after dependency removal
- [ ] Verify bundle size decreased
