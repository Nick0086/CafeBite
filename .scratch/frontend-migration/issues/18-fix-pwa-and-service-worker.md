# 18 — Fix PWA & service worker

**What to build:** The service worker registration uses Vite-compatible APIs, the hardcoded Vercel URL is removed, scaffold artifacts are cleaned up, and file extensions match content.

**Blocked by:** 01 — Fix critical runtime bugs, 02 — Remove redundant dependencies

**Status:** ready-for-agent

- [ ] Replace process.env.NODE_ENV with import.meta.env.DEV in serviceWorkerRegistration.js (if not already fixed in ticket 01)
- [ ] Remove hardcoded Vercel URL (https://cafe-bite.vercel.app) from serviceWorkerRegistration.js — use dynamic URL or environment variable
- [ ] Remove leftover react.svg from assets/ (Vite scaffold artifact)
- [ ] Rename use-mobile.jsx to use-mobile.js (or useIsMobile.js) — it contains no JSX, so .jsx extension is incorrect
- [ ] Verify service worker registers correctly in development
- [ ] Verify service worker registers correctly in production build
- [ ] Verify PWA features (offline support, install prompt) still work
- [ ] Verify no console errors from service worker registration
