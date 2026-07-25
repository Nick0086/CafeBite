# 01 — Fix critical runtime bugs

**What to build:** The app stops crashing from preventable runtime errors. Every known crash, data-loss bug, and React rules violation is fixed so the app is stable enough to migrate on top of.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Fix hooks called after conditional return in Sidebar (useLocation after early return violates Rules of Hooks)
- [ ] Fix undefined getFormSchema() call in table-qrcodeForm that crashes the form at runtime
- [ ] Fix missing import of imageCache in blobHealthCheck.js (ReferenceError at runtime)
- [ ] Fix undefined variable reference in MenuItemForm (categoryName should be menuItemName)
- [ ] Fix duplicate socialFacebook form field binding in Contact.jsx (Twitter handle never saved — data loss)
- [ ] Fix missing return statement in MenuIndex.jsx (conditional JSX block never renders)
- [ ] Replace process.env.NODE_ENV with import.meta.env.DEV in all Vite files (blobHealthCheck, cacheDebugger, usePerformanceMonitor)
- [ ] Fix --sidebar-background double percent sign in index.css (0 0% 100%% -> 0 0% 100%)
- [ ] Define --container CSS variable or remove the reference in App.css scrollbar track
- [ ] Verify app builds and runs without runtime crashes after all fixes
