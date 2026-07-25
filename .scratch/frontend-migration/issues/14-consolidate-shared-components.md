# 14 — Consolidate shared components

**What to build:** All duplicated shared components are consolidated into single implementations in common/. Dead code is removed. Every module uses the shared versions instead of local copies.

**Blocked by:** 04 — Migrate Dashboard module, 05 — Migrate Sidebar module, 06 — Migrate Authentication module, 07 — Migrate QrCode module, 08 — Migrate ProfileManagement module, 09 — Migrate CustomerMenu module, 10 — Migrate ClientSupport module, 11 — Migrate Menu parent + Categories, 12 — Migrate Menu/MenuItems, 13 — Migrate Menu/Templates

**Status:** ready-for-agent

- [ ] Create common/StatusBadge.jsx — single implementation, replace all 4 copies (CustomerMenuViewer, OptimizedMenuItem, OrderDrawer, MenuCard)
- [ ] Create utils/file.utils.js with formatFileSize — single implementation, replace all 3 copies (FeedbackAttachment, FileUploadArea, ImageViewerModal)
- [ ] Create common/InlineSelector.jsx — merge FeedbackStatusSelector and FeedbackTypeSelector into one generic component with props
- [ ] Create common/Table/CommonTableToolbar.jsx — single implementation with props, replace all 3 copies (Categories, MenuItems, Templates) — if not already done in ticket 11
- [ ] Remove OptimizedMenuItem.jsx if confirmed unused (CustomerMenuViewer defines its own inline MenuItem)
- [ ] Remove all commented-out code blocks across the codebase (Dashboard.jsx ~70 lines, ProfileManagement.jsx ~130 lines, Login.jsx, CustomerMenuViewer.jsx, etc.)
- [ ] Verify all modules that used the duplicated components now import from common/
- [ ] Verify no visual regressions from the consolidation
- [ ] Verify bundle size decreased from deduplication
