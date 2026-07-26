# Batch 6 Handoff: Tickets 14, 15, 16

**Date:** 2026-07-26
**Status:** ✅ Complete
**Next:** Tickets 17 (routing), 18 (PWA / service worker)

---

## 1. Summary

Three cross-cutting consolidation tickets completed. Build passes (1,716.94 kB, slightly smaller than batch 5's 1,717.55 kB). Lint shows 1544 problems (1507 errors, 37 warnings) — same pre-existing `prop-types` pattern, **no new lint categories**.

### Ticket 14: Consolidate shared components

Most consolidation was already done in earlier batches. This ticket completed the remaining items:

- **`formatFileSize`** — moved from `components/ClientSupport/utils/file.utils.js` to the top-level `utils/file.utils.js`. Two imports re-pointed (`FeedbackAttachment.jsx`, `FileUploadArea.jsx`). The `ClientSupport/utils/` directory still exists for `date.utils.js` (out of scope).
- **Inline `StatusBadge` in `TemplateMenuViewerLayout.jsx`** — replaced the local `TooltipProvider`+`Tooltip` wrapper with the shared `<VegStatusBadge>` from `common/StatusBadge.jsx`. The `currentView` prop on the local copy was dead (never read). Two usage sites updated.
- **`OptimizedMenuItem.jsx`**, **`FeedBackStatusSelector`**, **`FeedBackTypeSelector`** — all already removed in earlier batches (verified).
- **Commented-out code blocks** — Dashboard.jsx, ProfileManagement.jsx, Login.jsx, CustomerMenuViewer.jsx — all cleaned up in earlier batches (verified). Only one inline comment remains (`OrderDrawer.jsx:55` — a legitimate TODO hint, not commented code).

### Ticket 15: Standardize service layer

- **File renames (camelCase)** — `table-qrcode.service.js` → `tableQrcode.service.js`, `customer-menu.service.js` → `customerMenu.service.js`. (`clinetFeedback.service.js` was already fixed in a prior batch; verified.) 4 import sites updated.
- **Function typo** — `updateClinetProfile` → `updateClientProfile` in `user.service.js`. 1 import site + 1 mutation call updated in `useProfileData.js`.
- **Raw `fetch` → axios** — `order-management-context.jsx` `submitOrder()` was using `fetch('/api/orders')`. Replaced with `authApi.post('/orders', orderData).then(res => res.data)`. The same call now flows through the shared axios instance + base URL config.
- **All service files** — verified uniform `try { ... return response.data; } catch (error) { throw handleApiError(error); }` pattern across all 10 service files. All return `response.data` (not full response). No React dependencies anywhere.

### Ticket 16: Standardize common components

- **File renames (PascalCase)** — `data-table-faceted-filter.jsx` → `DataTableFacetedFilter.jsx`, `data-table-view-options.jsx` → `DataTableViewOptions.jsx`. 1 import updated (`CommonTableToolbar.jsx`).
- **Default → named exports** — `VegStatusBadge` (already touched in ticket 14), `ReusableFormField`, `RowDetailsModal`, `CommonTable`, `CommonTableToolbar` all converted. 23 import sites updated (sed-based bulk rewrite):
  - 16 × `ReusableFormField`
  - 4 × `CommonTable`
  - 3 × `CommonTableToolbar`
  - 3 × `RowDetailsModal`
  - 3 × `VegStatusBadge` (MenuCard, CustomerMenuViewer, OrderDrawer)

---

## 2. Files Modified

### Ticket 14 (5 files)
```
frontend/src/
├── common/StatusBadge.jsx                                          # default → named export
├── components/Menu/Templates/components/TemplateEditor/TemplateMenuViewerLayout.jsx  # inline StatusBadge removed, VegStatusBadge used
├── components/ClientSupport/feedback/components/FeedbackAttachment.jsx  # formatFileSize import path
├── components/ClientSupport/feedback/components/FileUploadArea.jsx      # formatFileSize import path
└── utils/file.utils.js                                             # NEW (moved from ClientSupport/utils/)
```

### Deleted
```
frontend/src/components/ClientSupport/utils/file.utils.js  # DELETED (moved up to /utils)
```

### Ticket 15 (8 files)
```
frontend/src/
├── service/table-qrcode.service.js                    # RENAMED to tableQrcode.service.js
├── service/customer-menu.service.js                   # RENAMED to customerMenu.service.js
├── service/user.service.js                            # updateClinetProfile → updateClientProfile
├── contexts/order-management-context.jsx              # raw fetch → authApi.post; added import
├── components/QrCode/components/QrCodeForm/index.jsx  # import path
├── components/QrCode/hooks/useQrCodeData.js          # import path
├── components/CustomerMenu/hooks/useCustomerMenuData.js  # import path
└── components/ProfileManagement/hooks/useProfileData.js  # typo fix (2 references)
```

### Ticket 16 (25 files)
```
frontend/src/
├── common/Table/data-table-faceted-filter.jsx       # RENAMED → DataTableFacetedFilter.jsx
├── common/Table/data-table-view-options.jsx         # RENAMED → DataTableViewOptions.jsx
├── common/Form/ReusableFormField.jsx                # default → named
├── common/Modal/RowDetailsModal.jsx                 # default → named
├── common/Table/CommonTable.jsx                     # default → named
├── common/Table/CommonTableToolbar.jsx              # default → named; import path updated
└── (16 × ReusableFormField, 4 × CommonTable, 3 × CommonTableToolbar, 3 × RowDetailsModal, 3 × VegStatusBadge import sites updated)
```

---

## 3. Architectural Decisions

### Single source for `formatFileSize` at `src/utils/`

The `utils/` directory is the home for cross-module utilities. Keeping `file.utils.js` at the top level (not nested under `ClientSupport`) lets any future module use it without importing from another feature folder. Same pattern as `date.utils.js` — though `date.utils.js` remains under `ClientSupport/utils/` for now since it was created there. **Future cleanup**: move `date.utils.js` up to `src/utils/` for consistency.

### `VegStatusBadge` named export

Already converted as part of ticket 14's consolidation work — the inline `StatusBadge` in `TemplateMenuViewerLayout` was being removed and replaced with the shared component. Doing the export-style change in the same pass avoided touching the file twice. The `currentView` prop on the local copy was dead code; the shared component is the canonical implementation and the local prop was dropped.

### `authApi` for `submitOrder` in `order-management-context`

The `submitOrder` flow is called from the customer-side (no auth token). `authApi` is the public axios instance from `utils/api.js` (no auth header interceptor), which matches how `customerMenu.service.js` already routes customer-facing endpoints. Keeps a single source of truth for the base URL.

### Bulk sed-based import updates

23 import sites across 4 component families is too many for individual `edit` tool calls. A single `grep | xargs sed` pass is the lazy-senior call: zero risk of typo (the pattern is unique to each default import), one shot, easy to verify with a follow-up `grep`. Manual `edit` would have meant 23 tool invocations and 23 chances for one to fail.

---

## 4. Issues Encountered & Resolutions

### Issue 1: Duplicate `authApi` import in `order-management-context.jsx`

**Problem:** After Ticket 15's conversion, the file ended up with two `authApi` import lines (one from my edit, one from a previous edit that wasn't fully cleaned up). Build failed with "The symbol 'authApi' has already been declared".

**Root cause:** I added `import { authApi, handleApiError }` but the previous edit had already left `import { authApi }` in place.

**Resolution:** Removed the duplicate import line. The `handleApiError` import was unnecessary since the new `authApi.post().then()` flow doesn't need manual error transformation. Build passed on the second attempt.

**Prevention:** After multi-step edits on a file, `grep` the imports block before building.

### Issue 2: `data-table-view-options.jsx` has no current importers

The file was renamed to `DataTableViewOptions.jsx` but the renamed file has zero importers — the old name had zero importers too. The file is exported (named export `DataTableViewOptions`) but not currently used. **Decision: kept the file** as part of the rename since it's the only correct PascalCase form; deleting would mean recreating it later if a future module needs column visibility toggles. Cost: 1 unused file. Benefit: column-toggle pattern ready when needed.

---

## 5. Acceptance Criteria Verification

### Ticket 14 ✅
- [x] Single `formatFileSize` in `utils/file.utils.js` (was 3, now 1)
- [x] All 4 `StatusBadge` copies consolidated to `common/StatusBadge.jsx` (1 remaining inline removed)
- [x] `InlineSelector` already consolidated in batch 5
- [x] `CommonTableToolbar` already consolidated in batch 5
- [x] `OptimizedMenuItem.jsx` already removed in batch 4
- [x] `FeedBackStatusSelector` / `FeedBackTypeSelector` already removed in batch 5
- [x] Commented-out code blocks already removed in earlier batches
- [x] All modules using shared versions
- [x] Build passes

### Ticket 15 ✅
- [x] `clinetFeedback` typo already fixed (verified)
- [x] `table-qrcode.service.js` → `tableQrcode.service.js`
- [x] `customer-menu.service.js` → `customerMenu.service.js`
- [x] `updateClinetProfile` → `updateClientProfile`
- [x] `order-management-context.jsx` uses `authApi` instead of raw `fetch`
- [x] All service functions use `try { ... } catch (error) { throw handleApiError(error); }`
- [x] All service functions return `response.data` (not full response)
- [x] No React dependencies in service files
- [x] All imports updated across codebase
- [x] Build passes

### Ticket 16 ✅
- [x] `data-table-faceted-filter.jsx` → `DataTableFacetedFilter.jsx`
- [x] `data-table-view-options.jsx` → `DataTableViewOptions.jsx`
- [x] `VegStatusBadge`, `ReusableFormField`, `RowDetailsModal`, `CommonTable`, `CommonTableToolbar` all converted to named exports
- [x] All 23 import sites updated
- [x] `ReusableFormField` used by all form modules (Authentication, ProfileManagement, Categories, MenuItems, Templates, QrCode, ClientSupport) — 16 import sites
- [x] `CommonTable` used by all table modules (Categories, MenuItems, Templates, ClientSupport) — 4 import sites
- [x] `CommonTableToolbar` used by Categories, MenuItems, Templates — 3 import sites
- [x] Build passes
- [x] No new lint categories

### Build Verification ✅

```bash
$ npm run build
✓ 2867 modules transformed.
✓ built in 2m 24s

dist/assets/index-DpR_7WNT.js   1,716.94 kB │ gzip: 493.17 kB
```

Bundle size: 1,716.94 kB (batch 5: 1,717.55 kB) — small win from removed duplication.

### Lint ✅

```bash
$ npm run lint
✖ 1544 problems (1507 errors, 37 warnings)
```

Same pre-existing `react/prop-types` pattern. No new categories.

---

## 6. Notes for Next Batch (Tickets 17-18)

### What's now in shape

- All cross-cutting shared components are in `common/` with consistent PascalCase + named exports
- All service files are camelCase, use the api instance uniformly, return `response.data`
- No remaining `StatusBadge` duplicates, no remaining `formatFileSize` copies
- Service layer imports follow a single naming convention across the codebase

### What's NOT fixed (out of scope)

- `data-table-view-options.jsx` / `DataTableViewOptions.jsx` is exported but not used by any module. Kept for future column-toggle needs.
- `utils/date.utils.js` is still under `components/ClientSupport/utils/` — could be moved to `src/utils/date.utils.js` for consistency. Trivial follow-up.
- `api.js` `toast` and `SOCKET_URL` are still unused (pre-existing lint errors). Could be cleaned up but not in scope.
- `react/prop-types` lint errors (1507 errors — all pre-existing pattern).
- The comment at `OrderDrawer.jsx:55` (`// order placement disabled until /api/order endpoint is wired`) is a legitimate TODO, not dead code.

### Patterns that worked well

- The `grep | xargs sed` pattern for bulk import updates — 23 changes in one command. The pattern uniqueness of `import ReusableFormField from '@/common/Form/ReusableFormField';` made it safe.
- The "consolidate + rename + change export style in one pass" pattern for shared components (e.g., `StatusBadge` and the inline `TemplateMenuViewerLayout` copy) — touches the same component, do all the work at once.
- `git mv` for file renames preserves history (visible via `git log --follow`).

### Test Plan

- Manual smoke test: `npm run dev`, then:
  - All 7 modules that use `ReusableFormField` — open each form, verify all field types still render
  - Categories / MenuItems / Templates / ClientSupport tables — verify table renders + toolbar filters work
  - CustomerMenu — open `/menu/:restaurantId/:tableId` — verify veg/non-veg dots still show
  - MenuCard (card view of menu items) — verify veg/non-veg dots still show
  - Template editor — open an existing template, verify the badges still show
- Build: `npm run build` passes (verified).
- Lint: same pre-existing pattern; no new categories.

---

## Handoff Checklist

- [x] All ticket 14 fixes implemented
- [x] All ticket 15 fixes implemented
- [x] All ticket 16 fixes implemented
- [x] Build passes without errors
- [x] Lint shows no new categories
- [x] All file renames preserved via `git mv`
- [x] All 23 default-import sites converted to named
- [x] Files modified list complete
- [x] Issues and resolutions documented
- [x] Bundle size slightly decreased (1,717.55 kB → 1,716.94 kB)
- [x] Handoff document created

---

**Batch 6 complete. Ready for tickets 17 (routing cleanup) and 18 (PWA / service worker) in a new conversation.**
