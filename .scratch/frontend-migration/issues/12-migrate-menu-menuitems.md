# 12 — Migrate Menu/MenuItems

**What to build:** The MenuItems sub-module conforms to the cafebite-frontend standard with proper Table/ and Form/ folders. The isDireact typo, categoryName undefined variable, and server-cache-in-useState anti-pattern are all fixed. Card and table dual views are preserved.

**Blocked by:** 11 — Migrate Menu parent + Categories

**Status:** ready-for-agent

- [ ] Create components/MenuItemsTable/ folder with index.jsx, MenuItemsColumns.jsx, MenuItemsRowActions.jsx, MenuItemsToolbar.jsx
- [ ] Create components/MenuItemsForm/ folder with index.jsx, MenuItemsFormFields.jsx, MenuItemsFormFooter.jsx
- [ ] Move inline form schema from MenuItemForm.jsx:19-24 to validation/menuItem.schema.js (zod-only)
- [ ] Fix isDireact typo to isDirect throughout the module (MenuItemForm.jsx:38 and all references)
- [ ] Fix undefined categoryName variable in MenuItemForm.jsx:130 (should be menuItemName)
- [ ] Remove server-cache-in-useState anti-pattern in MenuCard.jsx:152 — use data?.menuItems directly instead of mirroring to useState
- [ ] Preserve dual view (card + table) — MenuCard.jsx and MenuTable.jsx both work correctly
- [ ] Extract MenuCardFilters into components/ if not already
- [ ] Create hooks/useMenuItemsData.js — TanStack Query hooks
- [ ] Create hooks/useMenuItemsForm.js — RHF setup with zod resolver
- [ ] Create hooks/useMenuItemsFilter.js — filter state for card/table views
- [ ] Create constants/menuItem.constants.js — extract from MenuItems/utils.js
- [ ] Use common/Table/CommonTableToolbar.jsx (extracted in ticket 11) instead of local copy
- [ ] Verify menu items CRUD works correctly in both table and card views
- [ ] Verify filters work correctly in both views
- [ ] Verify image upload works correctly for menu items
