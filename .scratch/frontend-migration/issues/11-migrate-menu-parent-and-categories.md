# 11 — Migrate Menu parent + Categories

**What to build:** The Menu parent module and its Categories sub-module conform to the cafebite-frontend standard. MenuIndex is restructured, Categories gets proper Table/ and Form/ folders, the schema is extracted to validation/, the query key typo is fixed, and CommonTableToolbar is extracted to a shared component.

**Blocked by:** 01 — Fix critical runtime bugs, 02 — Remove redundant dependencies

**Status:** ready-for-agent

- [ ] Restructure Menu/MenuIndex.jsx — fix missing return statement in hideTabs conditional (MenuIndex.jsx:28-40)
- [ ] Create components/CategoriesTable/ folder with index.jsx, CategoriesColumns.jsx, CategoriesRowActions.jsx, CategoriesToolbar.jsx
- [ ] Create components/CategoriesForm/ folder with index.jsx, CategoriesFormFields.jsx, CategoriesFormFooter.jsx
- [ ] Move inline form schema from CategoriesForm.jsx:14-19 to validation/category.schema.js (zod-only)
- [ ] Fix query key typo 'menu-catgeory' to 'menu-category' in Categories/utils.js
- [ ] Extract CommonTableToolbar from Categories/components/ to common/Table/CommonTableToolbar.jsx with props for customization (this will be reused by MenuItems and Templates)
- [ ] Create hooks/useCategoriesData.js — TanStack Query hooks
- [ ] Create hooks/useCategoriesForm.js — RHF setup with zod resolver
- [ ] Create constants/category.constants.js — extract from Categories/utils.js
- [ ] Verify categories CRUD (list, create, edit, delete) works correctly
- [ ] Verify MenuIndex renders correctly with tabs (templates, categories, menu items)
- [ ] Verify hideTabs conditional rendering works correctly
