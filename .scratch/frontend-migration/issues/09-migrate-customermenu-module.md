# 09 — Migrate CustomerMenu module

**What to build:** The CustomerMenu module conforms to the cafebite-frontend standard with a proper components/ subdirectory. StatusBadge is consolidated to a single shared component, hardcoded currency symbols are fixed, and dead code is removed.

**Blocked by:** 01 — Fix critical runtime bugs, 02 — Remove redundant dependencies

**Status:** ready-for-agent

- [ ] Create components/ subdirectory
- [ ] Move CustomerMenuViewer.jsx into components/
- [ ] Move OrderDrawer.jsx into components/
- [ ] Move QrCodeCheckbox.jsx into components/ (if belongs here) or confirm it belongs in QrCode module
- [ ] Consolidate StatusBadge — replace 4 copies (CustomerMenuViewer, OptimizedMenuItem, OrderDrawer, MenuCard) with single shared component at common/StatusBadge.jsx
- [ ] Fix hardcoded $ currency symbol in OptimizedMenuItem.jsx:158 and OrderDrawer.jsx:41 — use dynamic currencyInfo/currencySymbol
- [ ] Decide on OptimizedMenuItem.jsx — it appears unused (CustomerMenuViewer defines its own inline MenuItem). Either integrate it or remove it as dead code
- [ ] Create hooks/useCustomerMenuData.js — TanStack Query hooks for customer menu data
- [ ] Create constants/customerMenu.constants.js — extract from utils.js
- [ ] Remove useEffect-based error toasting pattern (CustomerMenuIndex.jsx:50-60) — handle at query level or shared hook
- [ ] Verify customer menu renders correctly for public-facing QR scan flow
- [ ] Verify order drawer works correctly
- [ ] Verify currency displays dynamically based on cafe settings
