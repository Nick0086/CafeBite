# 16 — Standardize common components

**What to build:** All common/ files follow PascalCase naming, use consistent named exports, ReusableFormField is used by all form modules, and CommonTable is used by all table modules.

**Blocked by:** 14 — Consolidate shared components

**Status:** ready-for-agent

- [ ] Rename data-table-faceted-filter.jsx to DataTableFacetedFilter.jsx
- [ ] Rename data-table-view-options.jsx to DataTableViewOptions.jsx
- [ ] Convert default exports to named exports for ReusableFormField, RowDetailsModal, CommonTable (verify consistency)
- [ ] Update all imports across the codebase that reference renamed common components
- [ ] Verify ReusableFormField is used by all form modules (Authentication, ProfileManagement, Categories, MenuItems, Templates, QrCode, ClientSupport)
- [ ] Verify CommonTable is used by all table modules (Categories, MenuItems, Templates, QrCode, ClientSupport)
- [ ] Verify no visual regressions from export style changes
- [ ] Verify all imports resolve correctly
