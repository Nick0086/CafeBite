# Spec: Frontend Migration to CafeBite Standards

## Problem Statement

The CafeBite frontend (`frontend/`) has grown organically with **zero modules** conforming to the established `cafebite-frontend` standard. The codebase suffers from:

- **No module structure**: None of the 9 feature modules follow the required folder convention (`Index.jsx`, `components/`, `hooks/`, `constants/`, `validation/`)
- **Pervasive naming inconsistencies**: 30+ typos in filenames, routes, query keys, variable names, and directory names (e.g., `ClinetSupport`, `tamplate`, `PASSWAORD_RESET`, `menu-catgeory`)
- **Critical runtime bugs**: Hooks called after conditional returns (`Sidebar.jsx:66-71`), undefined function calls (`table-qrcodeForm.jsx` — `getFormSchema()` undefined), missing imports (`blobHealthCheck.js` — `imageCache` not imported), undefined variable references (`MenuItemForm.jsx:130` — `categoryName` should be `menuItemName`), duplicate form field bindings (`Contact.jsx:55` — `socialFacebook` bound twice, Twitter never saved)
- **Duplicated code**: `StatusBadge` (4 copies), `formatFileSize` (3 copies), `FeedBackStatusSelector`/`TypeSelector` (95% identical, 136 lines each), `CommonTableToolbar` (3 copies), `schema.js` (2 copies with mixed yup+zod)
- **Mixed validation libraries**: Both `yup` and `zod` used in the same files (`Authentication/schema.js`, `ProfileManagement/schema.js`)
- **Redundant dependencies**: `moment` (300KB) alongside `date-fns`; `framer-motion` alongside `motion`; `react-toastify` alongside shadcn `Toaster`
- **Broken design tokens**: `primary` color defined twice in `tailwind.config.js` (second overwrites first), `--container` CSS variable referenced but never defined, `--sidebar-background` has double percent sign (`0 0% 100%%`), custom semantic tokens have no dark mode overrides
- **Anti-patterns**: Server cache mirrored in `useState` (`MenuCard.jsx:152`), `useEffect` for navigation/redirects (Login, SignIn, ResetPassword, Registration), `localStorage` accessed directly in components (LoginWithOTP, LoginWithPassword, SignIn), god components (830-line `ProfileManagement.jsx`), inline styles
- **Inconsistent conventions**: Mixed kebab-case/camelCase/PascalCase for files, mixed default/named exports, `service/` vs `services/` naming confusion, inconsistent `@/` alias usage
- **Vite incompatibilities**: `process.env.NODE_ENV` used instead of `import.meta.env.DEV` (3 files), `"use client"` directive (Next.js-ism) in Vite project, hardcoded Vercel URL in service worker

## Solution

A phased migration of the entire `frontend/` codebase to conform to the `cafebite-frontend` standard, applying `codebase-design` principles (deep modules, clean seams, leverage) and `design-system` token architecture (primitive -> semantic -> component layers). The migration prioritizes **critical bug fixes first**, then **structural normalization**, then **design system consolidation**.

## User Stories

### Phase 0: Critical Bug Fixes (Must fix before anything else)

1. As a developer, I want hooks to not be called conditionally, so that the app doesn't crash with React's Rules of Hooks violation (`Sidebar.jsx:66-71` — `useLocation()` called after early return)
2. As a developer, I want all referenced functions to be defined, so that forms don't crash at runtime (`table-qrcodeForm.jsx` — `getFormSchema()` undefined)
3. As a developer, I want all imported modules to actually be imported, so that blob health checks don't throw ReferenceError (`blobHealthCheck.js` — `imageCache` used but not imported)
4. As a developer, I want variable names to match their definitions, so that menu item updates don't crash (`MenuItemForm.jsx:130` — `categoryName` should be `menuItemName`)
5. As a user, I want my social media Twitter handle to be saved correctly, so that duplicate `socialFacebook` bindings don't cause data loss (`Contact.jsx:55`)
6. As a developer, I want Vite environment variables to work correctly, so that `process.env.NODE_ENV` is replaced with `import.meta.env.DEV` in `blobHealthCheck.js`, `cacheDebugger.js`, `usePerformanceMonitor.js`
7. As a developer, I want CSS variables to be valid, so that scrollbar tracks render correctly (`--container` undefined in `App.css`) and sidebar background doesn't have double percent (`index.css:64`)
8. As a developer, I want the missing return statement fixed, so that the conditional JSX in `MenuIndex.jsx:28-40` actually renders when `hideTabs` is true

### Phase 1: Dependency Cleanup

9. As a developer, I want a single date library, so that bundle size is reduced and there's no confusion (`moment` removed, `date-fns` kept — replace `moment` usage in `order-management-context.jsx`)
10. As a developer, I want a single animation library, so that there's no redundancy (`framer-motion` kept as it's used across components, `motion` package removed)
11. As a developer, I want a single toast system, so that there's no confusion about which to use (`react-toastify` via `toast-utils.js` kept as established, shadcn `Toaster` removed from `App.jsx`)
12. As a developer, I want a single validation library, so that schemas are consistent (`zod` kept — already used with react-hook-form, `yup` removed — all yup schemas rewritten as zod)
13. As a developer, I want `service/` and `services/` to not be confusingly similar, so that I don't import from the wrong one (rename `services/ImageCacheService.js` to `lib/ImageCacheService.js` or `utils/ImageCacheService.js`)

### Phase 2: Design Token Consolidation

14. As a developer, I want design tokens to follow the three-layer architecture (primitive -> semantic -> component), so that theming is predictable and maintainable
15. As a developer, I want the `primary` color collision in `tailwind.config.js` resolved, so that `text-primary` actually works (remove duplicate, keep one definition)
16. As a developer, I want all custom semantic tokens (`--surface-background`, `--text-primary`, `--brand-primary`, `--status-danger`, `--accent-indigo`, etc.) to have dark mode overrides in `.dark` selector, so that dark mode works correctly
17. As a developer, I want all hardcoded colors in components replaced with design token references or Tailwind semantic classes, so that theme changes propagate everywhere
18. As a developer, I want the Tailwind config to be the single source of truth for the design system, so that component tokens map cleanly to Tailwind utilities
19. As a developer, I want the custom box shadows (`custom-bold`, `custom-blue`, etc.) to use token references instead of hardcoded HSL values

### Phase 3: Naming & Typo Fixes

20. As a developer, I want all directory names to be spelled correctly, so that imports are discoverable (`ClinetSupport` -> `ClientSupport`)
21. As a developer, I want all filenames to follow PascalCase convention for components, so that I can find components predictably (`DashboardINdex.jsx` -> `DashboardIndex.jsx`, `FeedBackAttchment.jsx` -> `FeedbackAttachment.jsx`, `FeedBackCommonet.jsx` -> `FeedbackComment.jsx`, `Iimage-placeholder.jsx` -> `ImagePlaceholder.jsx`, `PilsatingDotesLoader.jsx` -> `PulsatingDotsLoader.jsx`)
22. As a developer, I want all route paths to be spelled correctly, so that URLs are professional (`tamplate` -> `template` in `MenuRoutes.jsx`, `App.jsx`, `MenuIndex.jsx`, `TemplateEditorIndex.jsx`)
23. As a developer, I want all query keys to be spelled correctly, so that cache invalidation works (`PASSWAORD_RESET` -> `PASSWORD_RESET`, `menu-catgeory` -> `menu-category`, `customer-menu-catgeory` -> `customer-menu-category`, `queryKeyLoopUp` -> `queryKeyLookup`)
24. As a developer, I want all variable/prop names to be spelled correctly, so that code is readable (`isDireact` -> `isDirect`, `pagenation` -> `pagination`, `clinetInfo` -> `clientInfo`, `currenctCategoryItems` -> `currentCategoryItems`, `clinetFeedback` -> `clientFeedback`)
25. As a developer, I want consistent file naming: PascalCase for components, camelCase for services/hooks/utils, so that I can predict file names (`table-qrcodeIndex.jsx` -> `QrCodeIndex.jsx`, `table-qrcodeForm.jsx` -> `QrCodeForm.jsx`, `table-qrcodeToolBar.jsx` -> `QrCodeToolbar.jsx`)
26. As a developer, I want consistent export style (named exports for all components/services/hooks), so that imports are uniform
27. As a developer, I want service file names to be consistent camelCase (`clinetFeedback.service.js` -> `clientFeedback.service.js`, `table-qrcode.service.js` -> `tableQrcode.service.js`, `customer-menu.service.js` -> `customerMenu.service.js`)
28. As a developer, I want all SVG asset filenames to be consistent kebab-case (`Dashboard.svg` -> `dashboard.svg`, `supprot.svg` -> `support.svg`)

### Phase 4: Module Structure Migration

29. As a developer, I want `Authentication/` restructured: create `AuthenticationIndex.jsx` as entry, move `Registration/` and `components/` into `components/`, create `hooks/` for auth-related hooks, create `constants/` from `utils.js`, create `validation/` with zod-only schemas from `schema.js`
30. As a developer, I want `ClientSupport/` (renamed from `ClinetSupport/`) restructured: `ClientSupportIndex.jsx` at root, `components/Dashboard/` and `components/Feedback/` sub-modules, `hooks/` for data fetching, `constants/` from utils, `validation/` for feedback schemas
31. As a developer, I want `CustomerMenu/` restructured: `CustomerMenuIndex.jsx` as entry (already exists), create `components/` subdirectory for `CustomerMenuViewer`, `OrderDrawer`, `OptimizedMenuItem`, create `hooks/` for menu data, create `constants/` from utils
32. As a developer, I want `Dashboard/` restructured: `DashboardIndex.jsx` as entry, `components/MetricCard.jsx` stays, create `hooks/` for metrics data, create `constants/` for metric definitions (currently hardcoded)
33. As a developer, I want `Menu/Categories/` restructured: `CategoriesIndex.jsx` stays, create `components/CategoriesTable/` (index + Columns + RowActions + Toolbar), create `components/CategoriesForm/` (index + FormFields + FormFooter), create `hooks/`, move schema to `validation/`
34. As a developer, I want `Menu/MenuItems/` restructured: same pattern as Categories, with `MenuItemsTable/` and `MenuItemsForm/` folders, extract `MenuCard` and `MenuTable` into `components/`
35. As a developer, I want `Menu/Templates/` restructured: `TemplateIndex.jsx` stays, `TemplatesEditor/` becomes `components/TemplateEditor/` with proper sub-structure
36. As a developer, I want `ProfileManagement/` broken from its 830-line god component into: `ProfileManagementIndex.jsx` entry, `components/PersonalInfoSection.jsx`, `components/CafeInfoSection.jsx`, `components/LocationSection.jsx`, `components/ContactSection.jsx`, `components/SocialMediaSection.jsx`, `components/SubscriptionSection.jsx`, `hooks/useProfileData.js`, `hooks/useProfileForm.js`, `validation/profile.schema.js`
37. As a developer, I want `Sidebar/` restructured: `SidebarIndex.jsx` as entry, `components/SidebarNav.jsx`, `components/SidebarHeader.jsx`, `components/SidebarFooter.jsx`
38. As a developer, I want `Table-QrCode/` renamed to `QrCode/` and restructured: `QrCodeIndex.jsx` entry, `components/QrCodeTable/`, `components/QrCodeForm/`, `components/QrCodeGrid.jsx`, `hooks/` (already has 2 hooks), `validation/`
39. As a developer, I want all validation schemas extracted from component files into `validation/` directories with Zod-only schemas (`CategoriesForm.jsx:14-19`, `MenuItemForm.jsx:19-24`, `SignIn.jsx:23-43`, `ResetPassword.jsx:22-40`)
40. As a developer, I want all module constants extracted from `utils.js` into `constants/` directories (Authentication, ClientSupport, CustomerMenu, Menu sub-modules, QrCode)

### Phase 5: State Management & Data Fetching Normalization

41. As a developer, I want all server data fetched via TanStack Query (never `useState` + `useEffect`), so that caching, refetching, and loading states are consistent (fix `MenuCard.jsx:152` — `useState` mirroring `data.menuItems`)
42. As a developer, I want all modal state managed as a single object `{ open, mode, data }`, so that modal logic is predictable (fix `FeedBackIndex.jsx:25-29` — 5 separate useState calls; `MenuItemsIndex.jsx:50`; `table-qrcodeIndex.jsx:17`)
43. As a developer, I want all `localStorage` access for auth tokens to go through the auth service/interceptor, so that token management is centralized (fix `LoginWithOTP.jsx:33-35`, `LoginWithPassword.jsx:38-39`, `SignIn.jsx:47`)
44. As a developer, I want all navigation/redirects after auth to use route guards/loaders instead of `useEffect`, so that auth flow is secure and race-condition-free (fix `Login.jsx:63`, `SignIn.jsx:74`, `ResetPassword.jsx:104-108`, `Registration.jsx:110`)
45. As a developer, I want all error toasting handled at the query level or via a shared hook, so that error handling is consistent and DRY (remove repeated `useEffect(() => { if (error) toastError(...) }, [error])` from `DashboardINdex.jsx:25`, `FeedBackIndex.jsx:36`, `FeedBackDetails.jsx:28`, `CustomerMenuIndex.jsx:50-60`)
46. As a developer, I want all Context values memoized with `useMemo`, so that unnecessary re-renders are prevented (verify `PermissionsContext.jsx`, `TemplateContext.jsx` already does this)
47. As a developer, I want a proper `usePermissions()` custom hook exported from `PermissionsContext.jsx`, so that consumers don't use raw `useContext(PermissionsContext)`
48. As a developer, I want `order-management-context.jsx` to use the `api` axios instance instead of raw `fetch('/api/orders')`, so that it follows the established pattern
49. As a developer, I want the `"use client"` directive removed from `use-toast.js`, so that Next.js-isms don't linger in a Vite project

### Phase 6: Code Deduplication

50. As a developer, I want `StatusBadge` consolidated into a single shared component at `common/StatusBadge.jsx`, so that 4 copies (in `CustomerMenuViewer.jsx`, `OptimizedMenuItem.jsx`, `OrderDrawer.jsx`, `MenuCard.jsx`) become 1
51. As a developer, I want `formatFileSize` consolidated into a single utility at `utils/file.utils.js`, so that 3 copies (in `FeedBackAttchment.jsx`, `FileUploadArea.jsx`, `ImageViewerModal.jsx`) become 1
52. As a developer, I want `FeedBackStatusSelector` and `FeedBackTypeSelector` merged into one generic `InlineSelector` component at `common/InlineSelector.jsx`, so that 270 lines become ~140
53. As a developer, I want `CommonTableToolbar` consolidated into one shared component at `common/Table/CommonTableToolbar.jsx` with props for customization, so that 3 copies (Categories, MenuItems, Templates) become 1
54. As a developer, I want `Authentication/schema.js` and `ProfileManagement/schema.js` deduplicated into shared schemas at `common/validation/`, so that identical schemas aren't maintained in two places
55. As a developer, I want `useMenuImagePreloader` and `useMenuPreloader` consolidated into one hook if possible, so that near-duplicate hooks become one
56. As a developer, I want all commented-out code blocks removed, so that the codebase is clean (`Dashboard.jsx` ~70 lines, `ProfileManagement.jsx` ~130 lines, `Login.jsx`, `CustomerMenuViewer.jsx`)
57. As a developer, I want `OptimizedMenuItem.jsx` removed if unused (it appears to be dead code — `CustomerMenuViewer.jsx` defines its own inline `MenuItem`), or integrated if it should be used
58. As a developer, I want the duplicate `primary` color definition in `tailwind.config.js` resolved — keep one, remove the other

### Phase 7: Service Layer Cleanup

59. As a developer, I want all service files to follow consistent camelCase naming (`clinetFeedback.service.js` -> `clientFeedback.service.js`)
60. As a developer, I want all service functions to use the established `api` axios instance consistently (no raw `fetch()` calls)
61. As a developer, I want all service file function names to be spelled correctly (`updateClinetProfile` -> `updateClientProfile`)
62. As a developer, I want all service functions to follow the uniform `try/catch + handleApiError` pattern (verify all do)

### Phase 8: Common Components Standardization

63. As a developer, I want `common/` files to follow consistent PascalCase naming (`data-table-faceted-filter.jsx` -> `DataTableFacetedFilter.jsx`, `data-table-view-options.jsx` -> `DataTableViewOptions.jsx`)
64. As a developer, I want consistent export style across all common components (all named exports — fix `ReusableFormField.jsx`, `RowDetailsModal.jsx`, `CommonTable.jsx` which use default exports)
65. As a developer, I want `ReusableFormField` to be the single form field component used everywhere, so that form fields are consistent
66. As a developer, I want `CommonTable` to be used by all table modules, so that table rendering is consistent

### Phase 9: Routing Cleanup

67. As a developer, I want all route files to use `@/` alias for cross-directory imports, so that import style is consistent (fix `MenuRoutes.jsx` line 8 — relative import instead of `@/`)
68. As a developer, I want route paths to match their corrected module names (no more `tamplate`, `ClinetSupport`)
69. As a developer, I want the `App.jsx` route structure to be cleaner — the current URL-path-split approach (`pathname.split('/')` and checking against arrays) is fragile and should use proper React Router layout routes with nested `<Routes>`
70. As a developer, I want the placeholder `"Hyy"` at route `/` replaced with a proper Dashboard or redirect

### Phase 10: PWA & Service Worker Fixes

71. As a developer, I want the service worker registration to use Vite-compatible APIs (`import.meta.env.DEV` instead of `process.env.NODE_ENV`), so that it works correctly
72. As a developer, I want the hardcoded Vercel URL (`https://cafe-bite.vercel.app`) removed from `serviceWorkerRegistration.js`, so that it works in all environments
73. As a developer, I want the leftover `react.svg` asset removed from `assets/`, so that scaffold artifacts don't linger
74. As a developer, I want `use-mobile.jsx` renamed to `use-mobile.js` (or `useIsMobile.js`) since it contains no JSX, so that file extensions match content

## Implementation Decisions

### Module Structure (from `cafebite-frontend` standard)

Every feature module MUST follow this structure:

```
src/components/<ModuleName>/
  <ModuleName>Index.jsx          # Page entry — orchestrates everything
  components/                    # Module-specific components
    <Module>Table/               # ALWAYS a folder
      index.jsx                  # Table assembly + state
      <Module>Columns.jsx        # Column defs + cell renderers
      <Module>RowActions.jsx     # Edit -> Delete -> Info buttons
      <Module>Toolbar.jsx        # Filters, bulk actions
    <Module>Form/                # ALWAYS a folder
      index.jsx                  # Dialog wrapper + submit logic
      <Module>FormFields.jsx     # All input fields
      <Module>FormFooter.jsx     # Submit / Cancel buttons
    <Module>DeleteDialog.jsx     # Single file
  hooks/
    use<Module>Data.js           # React Query hooks
    use<Module>Form.js           # RHF setup
    use<Module>Filter.js         # Filter state
  constants/
    <module>.constants.js        # Options, enums, labels
  validation/
    <module>.schema.js           # Zod-only schemas
  utils.js                       # Module-specific helpers
```

### Deep Module Design (from `codebase-design` principles)

- **Small interface, deep implementation**: Each module exposes only what callers need via its `Index.jsx`. Internal components, form logic, and data transformations stay hidden behind the module's interface.
- **Seam placement**: The seam for each module is its `Index.jsx` entry point. All internal components are implementation details.
- **The deletion test**: If removing a module's shared utility causes complexity to reappear across N callers, the utility earns its keep. If it's just a pass-through, delete it.
- **One adapter means hypothetical, two means real**: Don't create interfaces/abstractions unless something actually varies across them. No interface with one implementation.
- **Leverage for callers, locality for maintainers**: Shared components (`StatusBadge`, `CommonTableToolbar`) should provide maximum capability (leverage) through a minimal props interface. Changes to shared behavior happen in one place (locality).

### Design Token Architecture (from `design-system` standard)

Three-layer token structure:

```
Primitive (raw HSL values in index.css :root)
       |
Semantic (purpose aliases: --text-primary, --brand-primary, --status-danger)
       |
Component (component-specific: --button-bg, --card-surface)
```

- All tokens defined as CSS custom properties in `index.css`
- Tailwind config maps semantic tokens to utility classes
- Dark mode overrides ALL tokens (including custom semantic ones)
- No hardcoded hex/rgb values in components — always `var(--token)` or Tailwind utility
- Fix `primary` collision: remove the first `primary: hsl(var(--text-primary))` definition, keep the standard shadcn `primary: { DEFAULT: hsl(var(--primary)), foreground: ... }` object
- Fix `--sidebar-background: 0 0% 100%%` -> `0 0% 100%`
- Define `--container` or remove the reference in `App.css`

### Validation: Zod Only

- Remove `yup` dependency entirely from `package.json`
- All schemas in `validation/<module>.schema.js` files
- All forms use `zodResolver` with `react-hook-form`
- Shared schemas (e.g., personal info, contact info, cafe info) extracted to `common/validation/shared.schema.js`
- The duplicated `VALIDATION_SCHEMAS` (yup) in `Authentication/schema.js` and `ProfileManagement/schema.js` are rewritten as zod and consolidated

### State Management Rules

| Data Type | Tool |
|-----------|------|
| Server data | TanStack Query exclusively — never `useState` + `useEffect` |
| Form data | react-hook-form with zod resolver |
| Modal state | Single object `{ open, mode, data }` |
| URL state | `useSearchParams` for filters/pagination/sort |
| Global UI | Context with `useMemo` values + custom hook accessor |
| Component UI | `useState` / `useReducer` |

### Service Layer Convention

- One file per backend module in `src/service/`
- All files use camelCase: `<module>.service.js`
- All functions use the `api` or `authApi` axios instance (never raw `fetch`)
- All functions follow the `try/catch + handleApiError` pattern
- Return `response.data`, not the full response
- No React dependencies in service files

### Toast System

- Keep `react-toastify` via `toast-utils.js` wrapper (already established)
- Remove shadcn `Toaster` from `App.jsx` (and the `sonner` dependency if only used for this)
- All toasting through `toastSuccess()` / `toastError()` from `@/utils/toast-utils`
- Limit: 3 toasts max (already configured)

### Date Library

- Keep `date-fns` (already in use, lightweight ~50KB)
- Remove `moment` dependency (~300KB)
- Replace `moment()` usage in `order-management-context.jsx` with `date-fns` `format()` / `parseISO()`

### Animation Library

- Keep `framer-motion` (already used across components for layout animations)
- Remove `motion` package (successor to framer-motion, but codebase uses framer-motion)

### File Naming Convention

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `CategoriesIndex.jsx`, `MetricCard.jsx` |
| Services | camelCase + `.service.js` | `categories.service.js` |
| Hooks | camelCase + `use` prefix | `useCategoriesData.js` |
| Constants | camelCase + `.constants.js` | `category.constants.js` |
| Validation | camelCase + `.schema.js` | `category.schema.js` |
| Utils | camelCase + `.utils.js` or `utils.js` | `date.utils.js` |
| Contexts | PascalCase + `Context` | `PermissionsContext.jsx` |
| Routes | PascalCase + `Routes` | `MenuRoutes.jsx` |

### Export Convention

- All components: **named exports** (`export function CategoryForm() {}`)
- All services: **named exports** (`export const getAllCategory = async () => {}`)
- All hooks: **named exports** (`export function useCategoriesData() {}`)
- No default exports except for module entry points (`Index.jsx` files)

### Migration Order (Dependency-Aware)

1. **Phase 0** — Bug fixes (no structural changes, just fix broken things)
2. **Phase 1** — Dependency cleanup (remove moment, yup, motion duplicate, shadcn Toaster)
3. **Phase 2** — Design tokens (fix CSS variables, tailwind config, dark mode)
4. **Phase 3** — Naming/typos (rename files, fix routes, fix query keys — break imports temporarily, fix in one pass per module)
5. **Phase 4** — Module restructuring (move files into standard folders, one module at a time)
6. **Phase 5** — State management normalization (convert useState+useEffect to TanStack Query, consolidate modal state)
7. **Phase 6** — Deduplication (extract shared components, remove dead code)
8. **Phase 7** — Service layer cleanup (rename files, fix function names, ensure all use `api` instance)
9. **Phase 8** — Common components standardization
10. **Phase 9** — Routing cleanup
11. **Phase 10** — PWA/service worker fixes

Each phase should be a separate PR. Within Phase 4, each module should be its own PR to keep diffs reviewable.

## Testing Decisions

### What Makes a Good Test

- Test **external behavior** (what the component renders, what the hook returns), not implementation details (internal state, number of re-renders)
- Test the **seam** (the module's interface), not the internals
- Prioritize **integration tests** for critical user flows (login, CRUD operations, order submission)
- Unit tests for utility functions (date formatting, validation schemas, token helpers)

### Modules to Test

| Module | Test Type | Priority |
|--------|-----------|----------|
| `auth.service.js` | Unit (mock axios) | High |
| `PrivateRoutes.jsx` | Integration (render + mock session) | High |
| All `validation/*.schema.js` | Unit (valid/invalid inputs) | High |
| `toast-utils.js` | Unit | Medium |
| `api.js` (interceptors) | Unit (mock axios) | High |
| `CommonTable.jsx` | Integration (render + data) | Medium |
| `ReusableFormField.jsx` | Integration (each input type) | Medium |
| Each module's `Index.jsx` | Integration (render + mock queries) | Medium |
| `cn()` utility | Unit | Low |
| `PermissionsContext` + `usePermissions` | Integration | Medium |

### Testing Stack

- **Vitest** (Vite-native, fast, compatible with existing setup)
- **@testing-library/react** for component tests
- **MSW (Mock Service Worker)** for API mocking
- **@testing-library/user-event** for interaction simulation

### Prior Art

The codebase currently has **zero tests**. This migration is the right time to introduce testing alongside structural changes. Each migrated module should include tests as part of its migration PR.

## Out of Scope

- **Backend API changes**: This spec covers frontend only. Backend endpoints, database schema, and server-side logic are not touched.
- **New features**: No new functionality is added during migration. This is a refactor, not a feature release.
- **TypeScript migration**: The codebase uses JSX (not TSX). Converting to TypeScript is a separate effort and out of scope.
- **PWA overhaul**: Service worker fixes are limited to Vite compatibility and hardcoded URL removal. Full PWA strategy is out of scope.
- **Performance optimization**: While deduplication and dependency removal will improve bundle size, explicit performance optimization (code splitting, lazy loading beyond current state) is out of scope.
- **Dark mode UI polish**: Fixing the design token architecture is in scope. Making every component look perfect in dark mode is out of scope (the tokens will enable it, but per-component dark mode tuning is future work).
- **Internationalization / currency**: Hardcoded `$` in customer menu is noted but full i18n is out of scope.
- **Order management**: The `order-management-context.jsx` exists but is not wired into any active route. Migrating it is low priority and out of scope for the main migration phases (only the `moment` -> `date-fns` and raw `fetch` -> `api` fixes are in scope).
- **Recharts / dashboard charts**: The Dashboard module has ~70 lines of commented-out chart code. Implementing real charts is out of scope; removing the dead code is in scope.

## Further Notes

### Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Breaking existing routes during rename | Use URL redirects for old route paths (`/menu-management/tamplate` -> `/menu-management/template`) during transition period |
| Import breakage during restructuring | Do one module at a time, verify build after each |
| Regressing auth flow | Phase 0 fixes auth-adjacent bugs first; test login flow after every phase |
| Team unfamiliarity with new structure | The `cafebite-frontend` skill and `docs/guide/frontend/` already document the target standard |
| Regressing the template editor | The template editor is the most complex module; migrate it last in Phase 4 with extra care |

### Metrics for Success

- **Zero** critical runtime bugs (Phase 0 items all resolved)
- **100%** modules conform to standard folder structure
- **Zero** `yup` imports remaining
- **Zero** `moment` imports remaining
- **Zero** hardcoded colors in components (all use design tokens)
- **Zero** duplicated shared components (StatusBadge, formatFileSize, etc.)
- **All** CSS variables valid and defined
- **All** dark mode tokens have overrides
- **Build passes** with no ESLint errors
- **Test coverage** > 60% for migrated modules

### Estimated Scope

| Phase | Files Touched | Estimated Effort |
|-------|--------------|-----------------|
| Phase 0: Bug fixes | ~10 files | 1-2 hours |
| Phase 1: Dependency cleanup | ~15 files | 2-3 hours |
| Phase 2: Design tokens | ~5 config files + ~30 component files | 4-6 hours |
| Phase 3: Naming/typos | ~50 files (renames + import updates) | 3-4 hours |
| Phase 4: Module restructuring | ~100 files (moves + import updates) | 8-12 hours |
| Phase 5: State management | ~30 files | 4-6 hours |
| Phase 6: Deduplication | ~20 files | 3-4 hours |
| Phase 7: Service cleanup | ~12 files | 1-2 hours |
| Phase 8: Common components | ~8 files | 1-2 hours |
| Phase 9: Routing | ~5 files | 1-2 hours |
| Phase 10: PWA fixes | ~3 files | 1 hour |
| **Total** | **~100+ unique files** | **~30-45 hours** |

### Dependency Graph (What Blocks What)

```
Phase 0 (bugs) ----+
Phase 1 (deps) ----+--> Phase 2 (tokens) --+
Phase 3 (naming) --+                       +--> Phase 4 (structure) --> Phase 5 (state)
                                           |         |
                                           +--> Phase 6 (dedup) <---+
                                           |
Phase 7 (services) ------------------------+
Phase 8 (common) --------------------------+
Phase 9 (routing) -------------------------+
Phase 10 (PWA) ----------------------------+
```

Phase 0, 1, 3 can run in parallel. Phase 2 depends on Phase 1 (tokens depend on knowing which deps remain). Phase 4 depends on Phase 3 (names must be correct before restructuring). Phase 5 depends on Phase 4 (structure must be in place before normalizing state). Phases 6-10 can run after Phase 4 in any order.

### Complete Inventory of Current Frontend Files

**Feature Modules (9):**
1. `Authentication/` — Login, SignIn, ResetPassword, Registration (4-step wizard), schema.js (mixed yup+zod), utils.js
2. `ClinetSupport/` (typo) — Dashboard + Feedback sub-modules, index.jsx, utils.js
3. `CustomerMenu/` — CustomerMenuIndex, CustomerMenuViewer, OptimizedMenuItem (unused?), OrderDrawer, utils.js
4. `Dashboard/` — Dashboard.jsx (hardcoded data, 70 lines commented out), MetricCard.jsx
5. `Menu/` — MenuIndex.jsx, Categories/, MenuItems/, Templates/ (with TemplatesEditor/)
6. `ProfileManagement/` — ProfileManagement.jsx (830 lines god component), schema.js
7. `Sidebar/` — Sidebar.jsx (hooks-after-conditional-return bug)
8. `Table-QrCode/` — table-qrcodeIndex.jsx, table-qrcodeForm.jsx, table-qrcodeToolBar.jsx, QrCodeGrid.jsx, QrCodeCheckbox.jsx, hooks/
9. `ui/` — ~60+ shadcn primitives + custom loaders + specialized inputs

**Shared Infrastructure:**
- `common/` — AppTooltip, PrivateRoutes, ReusableFormField, RowDetailsModal, CommonTable, data-table-faceted-filter, data-table-view-options
- `service/` — 10 API service files
- `services/` — ImageCacheService.js (confusingly similar name to `service/`)
- `utils/` — api.js, blobHealthCheck.js, cacheDebugger.js, serviceWorkerRegistration.js, toast-utils.js
- `hooks/` — use-mobile.jsx, use-toast.js, useMenuImagePreloader.js, useMenuPreloader.js, usePerformanceMonitor.js
- `contexts/` — order-management-context.jsx, PermissionsContext.jsx, TemplateContext.jsx
- `routes/` — FeedbackRoutes.jsx, MenuRoutes.jsx
- `lib/` — utils.js (cn() utility)

**Config Files:**
- package.json (75 deps, 11 devDeps)
- vite.config.js, tailwind.config.js, jsconfig.json, components.json, postcss.config.js, eslint.config.js
- src/App.jsx, src/main.jsx, src/index.css, src/App.css
