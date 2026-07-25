# 17 — Clean up routing

**What to build:** All route paths are corrected, @/ alias is used consistently for cross-directory imports, the App.jsx route structure is simplified from the fragile URL-path-split approach to proper React Router layout routes, and the "Hyy" placeholder is replaced.

**Blocked by:** 04 — Migrate Dashboard module, 05 — Migrate Sidebar module, 06 — Migrate Authentication module, 07 — Migrate QrCode module, 08 — Migrate ProfileManagement module, 09 — Migrate CustomerMenu module, 10 — Migrate ClientSupport module, 11 — Migrate Menu parent + Categories, 12 — Migrate Menu/MenuItems, 13 — Migrate Menu/Templates

**Status:** ready-for-agent

- [ ] Fix all route paths to match corrected module names (no more tamplate, ClinetSupport)
- [ ] Replace relative imports with @/ alias in MenuRoutes.jsx (line 8 — TemplateEditorIndex import)
- [ ] Replace relative imports with @/ alias in App.jsx (./common/PrivateRoutes, ./components/..., ./routes/...)
- [ ] Replace relative imports with @/ alias in main.jsx (./App.jsx, ./utils/serviceWorkerRegistration)
- [ ] Simplify App.jsx route structure — replace URL-path-split approach (pathname.split('/') and checking against arrays) with proper React Router layout routes and nested <Routes>
- [ ] Replace "Hyy" placeholder at route / with proper Dashboard component or redirect to /menu-management
- [ ] Verify all routes resolve correctly after restructuring
- [ ] Verify protected routes still redirect to /login when unauthenticated
- [ ] Verify public routes (customer menu) still work at /menu/:restaurantId/:tableId
- [ ] Verify restricted routes (login, register, reset-password) still work
- [ ] Verify nested routes (menu-management/*, ticket-management/*) still work with TabsContent
