# 13 — Migrate Menu/Templates

**What to build:** The Templates sub-module conforms to the cafebite-frontend standard. The tamplate typo is fixed in all route paths, the TemplateEditor gets proper sub-structure, and the TemplateContext is cleaned up.

**Blocked by:** 11 — Migrate Menu parent + Categories

**Status:** ready-for-agent

- [ ] Fix tamplate typo to template in all route paths (MenuRoutes.jsx, App.jsx, MenuIndex.jsx, TemplateEditorIndex.jsx)
- [ ] Fix tamplate typo in redirect paths and default routes
- [ ] Rename Templates/TemplatesEditor/ to components/TemplateEditor/ with proper sub-structure
- [ ] Create components/TemplateEditor/components/ for sidebar-header and other sub-components
- [ ] Standardize file naming in TemplateEditor (template-Styling.jsx -> TemplateStyling.jsx, template-categories.jsx -> TemplateCategories.jsx, etc.)
- [ ] Create components/TemplatesTable/ folder with index.jsx, TemplatesColumns.jsx, TemplatesRowActions.jsx, TemplatesToolbar.jsx
- [ ] Move inline form schema to validation/template.schema.js (zod-only)
- [ ] Create hooks/useTemplatesData.js — TanStack Query hooks
- [ ] Create hooks/useTemplateForm.js — RHF setup with zod resolver
- [ ] Create constants/template.constants.js — extract from Templates/utils.js, extract DEFAULT_THEME
- [ ] Clean up TemplateContext — verify it's properly memoized, fix any issues
- [ ] Use common/Table/CommonTableToolbar.jsx (extracted in ticket 11) instead of local copy
- [ ] Update MenuRoutes.jsx to use corrected route paths
- [ ] Verify templates list renders correctly
- [ ] Verify template editor (new + edit) works correctly with sidebar tabs (global, categories, items, styling)
- [ ] Verify live preview in template editor works correctly
- [ ] Verify drag-and-drop (dnd-kit) works correctly in template editor
