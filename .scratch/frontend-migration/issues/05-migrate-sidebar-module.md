# 05 — Migrate Sidebar module

**What to build:** The Sidebar module conforms to the cafebite-frontend standard. The layout is broken into composable sub-components (nav, header, footer), and the hooks-after-conditional-return bug is structurally prevented by the new folder layout.

**Blocked by:** 01 — Fix critical runtime bugs, 02 — Remove redundant dependencies

**Status:** ready-for-agent

- [ ] Create SidebarIndex.jsx as the module entry point (rename from Sidebar.jsx)
- [ ] Create components/ subdirectory
- [ ] Extract navigation links into components/SidebarNav.jsx
- [ ] Extract header/user-nav into components/SidebarHeader.jsx
- [ ] Extract footer into components/SidebarFooter.jsx (if applicable)
- [ ] Ensure all hooks (useLocation, useQuery, etc.) are called before any conditional returns — structurally enforced by the new entry point layout
- [ ] Move SVG asset imports to use @/ alias consistently (currently uses relative paths like ../../assets/SVG/...)
- [ ] Verify sidebar renders correctly on all routes
- [ ] Verify navigation links work correctly
- [ ] Verify full-screen mode (isfullScreen) still bypasses sidebar correctly
