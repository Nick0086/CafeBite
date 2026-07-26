# Code Review Report — CafeBite Frontend Migration (Batches 1–6)

**Date:** 2026-07-26
**Scope:** Frontend code added/modified by migration tickets 01–18
**Reviewer:** Senior engineer code review (10-criterion framework)
**Verdict:** ⚠️ **DO NOT MERGE AS-IS** — 3 critical, 9 high, 23 medium, 35+ low issues. Critical issues are user-facing security/broken-feature bugs.

---

## Top 10 Priority Fixes (do these first)

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | **critical** | `utils/api.js:35-37` | Refresh token leaked in every request as `user-data` header |
| 2 | **critical** | `contexts/order-management-context.jsx:137, 160, 196, 204` | `toast({title, description, status})` shape passed to `react-toastify` — every toast is silently broken |
| 3 | **critical** | `service/customerMenu.service.js` + `hooks/useCustomerMenuData.js` | URL params for `/customer-menu/template/{userId}/{tableId}` are mis-mapped at the call site — the hook calls with `tableId: restaurantId, userId: tableId`. Works by coincidence (since restaurant IS user), but the local-var naming is misleading and a renaming refactor will silently break it. |
| 4 | **high** | `routes/FeedbackRoutes.jsx:28` | `<Navigate to="/dashboard" replace />` redirects to a non-existent top-level route; loops with `App.jsx:42` |
| 5 | **high** | `index.css:55-56` | `--input` and `--ring` use commas (`228, 96%, 89%`); Tailwind `hsl(var(--input))` won't parse — `border-input`, `ring-*` render wrong colors |
| 6 | **high** | `components/Menu/MenuItems/components/MenuItemsTable/index.jsx:152-154` | Mutates a `useMemo`'d `extraFilters` object in place — `categoryFilter.requireColumn = true` |
| 7 | **high** | `components/Menu/MenuItems/hooks/useMenuItemsForm.js:28` | `parseFloat(selectedRow?.price) || null` — a `0` price becomes `null` (valid price lost) |
| 8 | **high** | `components/Menu/Templates/components/TemplateEditor/TemplateEditorIndex.jsx:81-93` | `useEffect` deps missing `error` — template-data error toasts never fire |
| 9 | **high** | `components/ProfileManagement/ProfileManagementIndex.jsx:53-60` | Form resets every time `permissions` reference changes; `useUpdateProfileMutation.onSuccess` invalidates `['client', 'data']` → re-fetches permissions → re-fires effect → wipes user's in-progress edit |
| 10 | **high** | `common/Table/CommonTable.jsx:71` | `stripedStyleTrue ?? 'bg-[#ededed]'` — `??` is wrong (false falls through); striping is **always on** regardless of the prop |

---

## 1. Maintainability

### M-1. `ReusableFormField` is a 361-line God component with a 14-arm switch
- **Location:** `frontend/src/common/Form/ReusableFormField.jsx:54-317`
- **Severity:** medium
- **Issue:** Single component handles 14 input types via a mega `switch`. Prop list spans 50 lines. Hard to extend, hard to test, violates single-responsibility.
- **Fix:** Split into `<FormTextField>`, `<FormSelectField>`, `<FormComboboxField>`, `<FormOTPField>`, `<FormSwitchField>`, `<FormCheckboxField>`, etc. `ReusableFormField` becomes a thin dispatcher by `type`.

### M-2. `CommentItem` is 207 lines
- **Location:** `frontend/src/components/ClientSupport/feedback/components/FeedbackComment.jsx:31-237`
- **Severity:** medium
- **Issue:** Reply list, comment actions, edit form, reply form, delete confirm all in one component.
- **Fix:** Split into `CommentItem`, `CommentActions`, `CommentReplyForm`, `CommentEditForm`.

### M-3. `TemplateMenuViewerLayout` is ~460 lines (god component)
- **Location:** `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateMenuViewerLayout.jsx`
- **Severity:** medium
- **Issue:** Preload orchestration, image rendering, mobile detection, category accordion all in one file.
- **Fix:** Extract `OptimizedImage`, `MenuItem`, `CategoryAccordion` into their own files.

### M-4. `MenuItem` inside `CustomerMenuViewer.jsx` is 126 lines
- **Location:** `frontend/src/components/CustomerMenu/components/CustomerMenuViewer.jsx:20-146`
- **Severity:** low
- **Fix:** Split into `MenuItemHeader` + `MenuItemActions`.

### M-5. `SortableCategoryItem` (60+ lines) duplicated across `TemplateCategories.jsx` and `TemplateItems.jsx`
- **Location:** `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateCategories.jsx:24-86` and `TemplateItems.jsx:28-75`
- **Severity:** low
- **Fix:** Extract a single `SortableRow` with a `type` prop or `children` render prop.

### M-6. `handleInputChange` indirection in `TemplateStyling.jsx`
- **Location:** `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateStyling.jsx:16`
- **Severity:** low
- **Issue:** `handleChange = (value) => onColorChange(colorKey, value)` → `handleInputChange = (e) => handleChange(e.target.value)` — two-step wrapper.
- **Fix:** Inline.

### M-7. `PriceFilter` defined inline in `MenuItemsTable/index.jsx`
- **Location:** `frontend/src/components/Menu/MenuItems/components/MenuItemsTable/index.jsx:32-97`
- **Severity:** low
- **Fix:** Move to its own file.

### M-8. `SidebarHeader` is named identically to imported shadcn `SidebarHeader`
- **Location:** `frontend/src/components/Menu/Templates/components/TemplateEditor/SidebarHeader.jsx:4`
- **Severity:** low
- **Issue:** Local component shadows the imported one — confusing.
- **Fix:** Rename local to `EditorSidebarHeader`.

### M-9. `useTemplate()` called twice in `TemplateEditorIndex.jsx`
- **Location:** `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateEditorIndex.jsx:27, 30`
- **Severity:** low
- **Fix:** Combine destructures.

---

## 2. Readability

### R-1. `'w-fullbg-gray-50/50'` missing space → invalid class
- **Location:** `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateEditorIndex.jsx:229`
- **Severity:** high (visible UI bug)
- **Fix:** `'w-full bg-gray-50/50'`.

### R-2. Typo "Somthing" in template error toast
- **Location:** `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateEditorIndex.jsx:223`
- **Severity:** low
- **Fix:** "Something".

### R-3. Typo `m;-4` and `ms:ml-8` in feedback comment classes
- **Location:** `frontend/src/components/ClientSupport/feedback/components/FeedbackComment.jsx:54`
- **Severity:** high (visible UI bug)
- **Fix:** `md:ml-8 ml-4`.

### R-4. `isfullScreen` is poorly cased
- **Location:** `frontend/src/components/Sidebar/SidebarIndex.jsx:16`
- **Severity:** low
- **Fix:** `isFullScreen`.

### R-5. `currenctCategoryItems` typo (state, plus setState, used in 4 files)
- **Location:** `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateEditorIndex.jsx:33` (and 3 sibling files)
- **Severity:** low
- **Fix:** Rename to `currentCategoryItems` everywhere.

### R-6. `min` standalone className
- **Location:** `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateMenuViewerLayout.jsx:423`
- **Severity:** low
- **Issue:** `className="... min overflow-auto"` — `min` alone is invalid.
- **Fix:** Remove the stray `min`.

### R-7. `setCurrentSubItemTab("Styling")` mixed casing
- **Location:** `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateCategories.jsx:147`
- **Severity:** low
- **Fix:** Use lowercase `'styling'` like other places.

### R-8. `import.meta.env.PROD === false` instead of `import.meta.env.DEV`
- **Location:** `frontend/src/components/QrCode/QrCodeIndex.jsx:80`, `frontend/src/components/QrCode/components/QrCodeGrid.jsx:80`
- **Severity:** low
- **Fix:** Use `.DEV`.

### R-9. `'Segoe UI'` listed twice in font stack
- **Location:** `frontend/src/index.css:24`
- **Severity:** low
- **Fix:** Remove the duplicate.

### R-10. Two `@layer base` blocks in `index.css`
- **Location:** `frontend/src/index.css:36-155, 157-165`
- **Severity:** low
- **Fix:** Merge into one block.

### R-11. `font-geist` doesn't reference the loaded web font
- **Location:** `frontend/tailwind.config.js:11`
- **Severity:** medium
- **Issue:** `fontFamily.geist: ['Geist', 'serif']` but `@font-face` registers `'Geist Sans Variable'`. Utility classes fall back to serif.
- **Fix:** `['"Geist Sans Variable"', 'sans-serif']`.

### R-12. Custom shadow tokens with typos
- **Location:** `frontend/tailwind.config.js:96-103`
- **Severity:** low
- **Issue:** `custom-war`, `custom-purpul` — typos. `custom` and `custom-medium` are identical.
- **Fix:** Rename or remove unused.

### R-13. `template` list page doesn't wrap in `TemplateProvider`
- **Location:** `frontend/src/routes/MenuRoutes.jsx:23-38`
- **Severity:** low
- **Issue:** Only the two `template-editor` routes get `<TemplateProvider>`. If the list page reads template context, it gets `undefined`.
- **Fix:** Verify list page doesn't need context; if it does, wrap once at the parent.

### R-14. Unused imports across the migrated codebase
- **Location:** multiple
- **Severity:** low
- **Examples:**
  - `Contact.jsx:3` — `import React from 'react'` (unused)
  - `Location.jsx:5` — `import { toast } from 'react-toastify'` (unused)
  - `Dashboard/components/MetricCard.jsx:4` — `import React from 'react'` (unused)
  - `Register Form etc.` — verify with `npx eslint .`
- **Fix:** Remove unused imports; the build is currently 1500+ lint errors.

### R-15. Unused `formatError` helpers in auth components
- **Location:** `frontend/src/components/Authentication/components/LoginWithOTP.jsx:11-16`, `LoginWithPassword.jsx:15-20`
- **Severity:** low
- **Fix:** Remove the dead helpers (or move to shared util if all 3 sites need the same logic — see X-3).

### R-16. Inline `style={{ fontFamily: 'Nunito, "Segoe UI", arial' }}` repeated on Sidebar, CategoriesForm, etc.
- **Severity:** low
- **Fix:** Move to a shared constant or `index.css` `:root` rule.

---

## 3. Scalability

### S-1. `CategoriesIndex` table paginates at `pageSize: 100` with no UI paginator
- **Location:** `frontend/src/components/Menu/Categories/components/CategoriesTable/index.jsx:29`
- **Severity:** low
- **Issue:** If a cafe has >100 categories, the rest are hidden. No "next page" UI.
- **Fix:** Add `DataTablePagination` (already used by `MenuItemsTable`).

### S-2. `MenuItemsIndex` table `count` uses array length, not server total
- **Location:** `frontend/src/components/Menu/MenuItems/components/MenuItemsTable/index.jsx:183`
- **Severity:** medium
- **Issue:** `count={data?.menuItems?.length || 0}` reports the visible page size as the total. With pagination, the displayed "total" stays 50 even after page 1.
- **Fix:** Pass `data?.pagination?.total` if the server returns it, or set `manualPagination: true` and bind to server data.

### S-3. `getMenuForCustomerByTableId` param naming is fragile
- **Location:** `frontend/src/service/customerMenu.service.js:4`
- **Severity:** low
- **Issue:** Function takes `{ tableId, userId }` but URL is `/template/{userId}/{tableId}`. The hook swaps them: `getMenuForCustomerByTableId({ tableId: restaurantId, userId: tableId })`. Works only because `restaurantId` IS `userId`. Refactoring to "rename userId → restaurantId" would break silently.
- **Fix:** Rename to `{ userId, tableId }` and pass straight through.

### S-4. Recursive `setTimeout` in `TemplateMenuViewerLayout` preload
- **Location:** `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateMenuViewerLayout.jsx:239`
- **Severity:** low
- **Issue:** `setTimeout(() => preloadBatch(urls, startIndex + batchSize), 200)` — no max depth, no cleanup on unmount. Could pile up timeouts if user scrolls many categories fast.
- **Fix:** Use a `mounted` ref or AbortController.

### S-5. `useMenuImagePreloader` and `useMenuPreloader` likely do the same thing
- **Location:** `frontend/src/hooks/useMenuImagePreloader.js` and `frontend/src/hooks/useMenuPreloader.js`
- **Severity:** low
- **Issue:** Both pre-load menu item images; one uses a key derived from IDs, the other uses a 1-second debounce. Verify they aren't duplicates.
- **Fix:** Consolidate if they share logic.

### S-6. `ImageCacheService`, `cacheDebugger.js`, `blobHealthCheck.js` — three dev-only modules side-effecting `window`
- **Location:** `frontend/src/lib/ImageCacheService.js`, `frontend/src/utils/cacheDebugger.js`, `frontend/src/utils/blobHealthCheck.js`
- **Severity:** low
- **Issue:** All register globals on import. Tree-shaking can't drop them, so the side effect fires in production builds.
- **Fix:** Either gate imports with `if (import.meta.env.DEV) { ... }` in callers, or accept the side effect (current behavior is intentional).

### S-7. `InlineSelector` `renderSelected` slot allows arbitrary JSX — typing is not enforced
- **Location:** `frontend/src/common/InlineSelector.jsx:31-45`
- **Severity:** low
- **Issue:** Slot accepts anything. Without TypeScript, no contract.
- **Fix:** Document the expected shape; accept this is a JS limitation.

### S-8. `MenuCard` polls `BlobHealthChecker` every render via 3s `setTimeout`
- **Location:** `frontend/src/components/Menu/MenuItems/MenuCard.jsx:132-148`
- **Severity:** medium
- **Issue:** `useEffect` dep is `menuItems` array; runs on every array reference change. With TanStack Query, this can fire on every poll. Wasted work + `setTimeout` chains.
- **Fix:** Trigger on mount only; or compare lengths.

### S-9. `updateMutation` optimistic update only patches the current page
- **Location:** `frontend/src/components/ClientSupport/hooks/useClientSupportData.js:65-78, 85-98`
- **Severity:** low
- **Issue:** After a status/type change, other pages of the feedback list are stale until refetch.
- **Fix:** Acceptable; flag for follow-up.

### S-10. `OrderHistoryProvider` mixes array and object shapes
- **Location:** `frontend/src/contexts/order-management-context.jsx:240-279`
- **Severity:** medium
- **Issue:** `useState({})` initial; `addItem` writes to keyed object; `clearOrder` resets to `[]`. The persist-guard `if (Object.keys(orderHistory || {})?.length > 0)` accidentally works (an array's `Object.keys` returns numeric keys).
- **Fix:** Pick one shape.

---

## 4. Security

### SEC-1. **Refresh token leaked in every authenticated request as `user-data` header**
- **Location:** `frontend/src/utils/api.js:35-37`
- **Severity:** **critical**
- **Issue:** `config.headers["user-data"] = token.refreshToken;` — the **long-lived refresh token** is sent on every request. This is the wrong header name (`Authorization` is the standard), and `withCredentials: true` already sends cookies, so this duplicates transport. Refresh tokens can be logged by intermediate proxies and should not ride every request.
- **Fix:** Remove the `user-data` header. If refresh-token rotation is needed, do it via a separate `/auth/refresh` endpoint and let the server read the refresh token from an httpOnly cookie. Otherwise the server should validate via cookie only.

### SEC-2. `user-data` (refresh token) leaks into 401 response logs and React DevTools
- **Location:** `frontend/src/utils/api.js:50-54`
- **Severity:** high
- **Issue:** 401 path logs `console.log("401 detected, signing out...")` and triggers a hard `window.location.href = "/login"`. The `user-data` header is also visible in browser devtools.
- **Fix:** Replace `console.log` with a silent redirect; remove the `user-data` header per SEC-1.

### SEC-3. `JSON.stringify(error)` in toast can leak server internals to user
- **Location:** `frontend/src/components/Authentication/hooks/useLoginMutations.js:26-27, 47-48, 69-70`, `usePasswordResetMutation.js:17`
- **Severity:** medium
- **Issue:** Toast shows the full serialized error (could include stack, request data, validation errors with internal field names).
- **Fix:** `toastError(error?.err?.message || 'Login failed')`.

### SEC-4. XSS risk in QrCode print iframe `srcDoc`
- **Location:** `frontend/src/components/QrCode/QrCodeIndex.jsx:92-137`
- **Severity:** medium
- **Issue:** Inline iframe HTML string interpolates server data (table name). If the server doesn't sanitize, a malicious table name could inject scripts.
- **Fix:** Build the iframe body via `contentDocument.body.append(...)` instead of string interpolation.

### SEC-5. `waitForToken` rejects and calls `window.localStorage.clear()`
- **Location:** `frontend/src/utils/api.js:60-79`
- **Severity:** high
- **Issue:** On timeout, `localStorage.clear()` wipes **all** keys (including `userData`, `restaurantOrder`, anything else). Should clear only auth-related keys.
- **Fix:** Use `tokenStore.clear()` (or remove specific keys).

### SEC-6. `waitForToken` does not `clearInterval` on reject
- **Location:** `frontend/src/utils/api.js:60-79`
- **Severity:** medium
- **Issue:** The `setInterval` only clears on the success branch. On `reject` (timeout), the interval continues until MAX_RETRIES naturally ends — but the reject branch fires earlier than the natural end, leaving a hung interval for `MAX_RETRIES - retries` ticks.
- **Fix:** `clearInterval` in both resolve and reject.

### SEC-7. Token keys duplicated between `auth.service.js` and `utils/api.js`
- **Location:** `frontend/src/service/auth.service.js` and `frontend/src/utils/api.js:53, 64-65`
- **Severity:** low
- **Issue:** Two sources of truth for the token key names. The 401 handler removes only `accessToken` (leaves `refreshToken`); next request retries with only the refresh token → 401 again → redirect loop.
- **Fix:** Use `tokenStore.clear()` in the interceptor; export `TOKEN_KEYS` from `auth.service.js`.

### SEC-8. `checkUserSession` uses the auth-required `api` instance
- **Location:** `frontend/src/service/auth.service.js:65`
- **Severity:** low (works on second try, wasteful)
- **Issue:** `api` triggers the `waitForToken` flow; for an unauthenticated check, this hits the wait/reject path first and clears localStorage. Should use `authApi`.
- **Fix:** `authApi.get('/auth/session/active')`.

### SEC-9. No CSRF / origin check on auth requests
- (Not a regression — the codebase never had it. Flag for future hardening.)

### SEC-10. `dashboard/DashboardIndex` renders the `<FeedbackIndex>` with a `pagination={false}` flag
- **Location:** `frontend/src/components/ClientSupport/dashboard/DashboardIndex.jsx:114`
- **Severity:** low
- **Issue:** Verification needed — is the prop honored? If not, the dashboard runs the full feedback query (with all data) on every dashboard render. Data exposure on a less-protected surface.
- **Fix:** Verify the prop gates the query; otherwise split the dashboard view into a read-only summary.

---

## 5. Performance

### PERF-1. **Mutation of memoized object breaks React referential equality**
- **Location:** `frontend/src/components/Menu/MenuItems/components/MenuItemsTable/index.jsx:152-154`
- **Severity:** **high**
- **Issue:** `extraFilters` is `useMemo`'d, then `categoryFilter.requireColumn = true` mutates it in place. This is React anti-pattern — subsequent renders see the mutated state from the previous render, and TanStack Toolbar receives a different shape than the memo expects.
- **Fix:** Either rebuild the filters array (`setExtraFilters((prev) => prev.map(...))`) or skip the `requireColumn` indirection.

### PERF-2. **`stripedStyleTrue ?? 'bg-[#ededed]'` — striping is always on**
- **Location:** `frontend/src/common/Table/CommonTable.jsx:71`
- **Severity:** medium (visible UI bug)
- **Issue:** `??` is the nullish-coalescing operator. `false ?? 'bg-[#ededed]'` returns `'bg-[#ededed]'` because `false` is not nullish. So the row class is always applied regardless of the prop.
- **Fix:** `stripedStyleTrue ? 'bg-[#ededed]' : ''` (or `&&`).

### PERF-3. Missing `useMemo` / `useCallback` in `OrderProvider` and `OrderHistoryProvider`
- **Location:** `frontend/src/contexts/order-management-context.jsx:215-228, 274-278`
- **Severity:** medium
- **Issue:** Context value is a plain object literal with fresh function refs every render. Every consumer re-renders on every state change.
- **Fix:** Wrap handlers in `useCallback`, context value in `useMemo`.

### PERF-4. `useEffect` deps include object reference for `permissions`
- **Location:** `frontend/src/components/ProfileManagement/ProfileManagementIndex.jsx:53-60` and `components/ClientSupport/feedback/FeedbackIndex.jsx:240-241`
- **Severity:** high (form-reset race; see F-1)
- **Issue:** If `permissions` is a context object, its reference may change on every parent render. Effect re-fires constantly.
- **Fix:** Depend on `permissions?.unique_id` (stable id).

### PERF-5. `useMenuImagePreloader` and `useMenuPreloader` add to ref but never retry on failure
- **Location:** `frontend/src/hooks/useMenuImagePreloader.js:37`
- **Severity:** low
- **Issue:** `preloadedRef.current.add(preloadKey)` even if preloading throws. Stale preloads.
- **Fix:** Acceptable for preloading; flag for follow-up.

### PERF-6. `cacheDebugger.getCacheStats` and `serviceWorkerRegistration.getCacheStats` duplicate the same logic
- **Location:** `frontend/src/utils/cacheDebugger.js:8-21` vs `frontend/src/utils/serviceWorkerRegistration.js:97-113`
- **Severity:** low
- **Fix:** Have one delegate to the other.

### PERF-7. `getCacheStats` in `serviceWorkerRegistration.js` is exported but never imported
- **Location:** `frontend/src/utils/serviceWorkerRegistration.js:97-113`
- **Severity:** low
- **Fix:** Remove the function (or fix #6).

### PERF-8. No route-level `React.lazy` — every page is in the initial bundle
- **Location:** `frontend/src/App.jsx:1-15`
- **Severity:** medium
- **Issue:** Heavy admin (template editor with drag-and-drop, image-crop, PDF) ships in the initial bundle for the customer menu page too. Materially inflates TTI on the customer flow.
- **Fix:** `React.lazy(() => import('@/routes/MenuRoutes'))`, `import('@/routes/FeedbackRoutes')`, `import('@/components/CustomerMenu/CustomerMenuIndex')`, `import('@/components/QrCode/QrCodeIndex')`. Wrap `<Routes>` in `<Suspense fallback={<Loader />}>`. At minimum, lazy the customer menu's editor dependencies.

### PERF-9. `categories` and `feedback` queries use `useMutation` for "is this page" reads in `PrivateRoutes`
- **Location:** `frontend/src/common/PrivateRoutes.jsx:16-30`
- **Severity:** medium
- **Issue:** `useMutation` is for side effects; session checks are reads. No retry/dedup; double-fires in StrictMode.
- **Fix:** Convert to `useQuery({ queryKey: ['session'], queryFn: checkUserSession, retry: false, staleTime: Infinity })`.

### PERF-10. `useEffect` in `PrivateRoutes` runs `userCheckMutation.mutate()` twice under StrictMode
- **Location:** `frontend/src/common/PrivateRoutes.jsx:42-44`
- **Severity:** medium
- **Issue:** No `ran` ref to gate the call. Two network requests on every mount in dev.
- **Fix:** Use a ref, or move to `useQuery` (built-in dedup).

### PERF-11. `useEffect` re-fires on object-ref change → extra renders in feedback form
- **Location:** `frontend/src/components/ClientSupport/feedback/FeedbackForm.jsx:18`
- **Severity:** medium
- **Issue:** `useEffect(() => { if (isOpen) setFiles([]); }, [isOpen, editData])` — `editData` change while modal is open wipes user's uploaded files.
- **Fix:** Drop `editData` from deps; reset only on `isOpen` transition to true.

### PERF-12. `MenuItemFormFields` watches `cover_image` and re-fires effect
- **Location:** `frontend/src/components/Menu/MenuItems/components/MenuItemsForm/MenuItemFormFields.jsx:25-27`
- **Severity:** low
- **Fix:** Use `form.formState.dirtyFields`.

---

## 6. Edge Cases

### E-1. **`parseFloat(price) || null` bug — `0` price becomes `null`**
- **Location:** `frontend/src/components/Menu/MenuItems/hooks/useMenuItemsForm.js:28`
- **Severity:** **high**
- **Issue:** A menu item with `price: 0` (free item, e.g. complimentary water) becomes `null` on form load. Submitting sends `null`, server may reject or store wrongly.
- **Fix:** `selectedRow?.price != null ? parseFloat(selectedRow.price) : null`.

### E-2. Empty `s3ImageUrl` on edit in `MenuItemFormFields`
- **Location:** `frontend/src/components/Menu/MenuItems/components/MenuItemsForm/MenuItemFormFields.jsx:110`
- **Severity:** medium
- **Issue:** `<ImageAvatar s3ImageUrl="" ... />` on edit shows an empty avatar even when the menu item has an image. Should pass `selectedRow?.cover_image`.
- **Fix:** Pass the actual value; verify `ImageAvatar` handles empty string vs. undefined.

### E-3. `Categories` form status type mismatch
- **Location:** `frontend/src/components/Menu/Categories/hooks/useCategoriesForm.js:17`
- **Severity:** medium
- **Issue:** `form.setValue('status', selectedRow?.status?.toString())` — form stores string, schema (`z.number()`) coerces. Works, but inconsistent.
- **Fix:** `Number(selectedRow?.status)`.

### E-4. `MenuItem` form same type mismatch
- **Location:** `frontend/src/components/Menu/MenuItems/hooks/useMenuItemsForm.js:33`
- **Severity:** medium
- **Fix:** `Number(selectedRow?.status) || 1`.

### E-5. `RowDetailsModal` crashes on `null` data
- **Location:** `frontend/src/common/Modal/RowDetailsModal.jsx:9-43`
- **Severity:** medium
- **Issue:** `Object.entries(data)` throws if `data === null`. Caller passes `data={selectedRow || {}}` to handle, but other callers may not.
- **Fix:** `if (!data) return null;` at the top.

### E-6. `selectedTab` initial undefined in `ClientSupportIndex`
- **Location:** `frontend/src/components/ClientSupport/ClientSupportIndex.jsx:9`
- **Severity:** low
- **Issue:** `useState()` with no default → Tabs may misbehave on first render.
- **Fix:** `useState('dashboard')`.

### E-7. `FeedbackComment` uses native `window.confirm`
- **Location:** `frontend/src/components/ClientSupport/feedback/components/FeedbackComment.jsx:113`
- **Severity:** low (UX)
- **Fix:** Replace with a styled confirm modal.

### E-8. `FileUploadArea` uses native `alert()` for validation
- **Location:** `frontend/src/components/ClientSupport/feedback/components/FileUploadArea.jsx:18, 22`
- **Severity:** low (UX)
- **Fix:** `toastError` from `@/utils/toast-utils`.

### E-9. `FileUploadArea` leaks blob URLs on unmount
- **Location:** `frontend/src/components/ClientSupport/feedback/components/FileUploadArea.jsx:35, 65`
- **Severity:** medium
- **Issue:** `URL.createObjectURL` is called per-file, but cleanup only happens on file removal. If user navigates away with files staged, blob URLs are never revoked.
- **Fix:** Add `useEffect` cleanup that revokes all previews on unmount.

### E-10. `FileUploadArea` `Math.random().toString(36).substr(2, 9)`
- **Location:** `frontend/src/components/ClientSupport/feedback/components/FileUploadArea.jsx:28`
- **Severity:** low
- **Issue:** `substr` is deprecated.
- **Fix:** `substring` or `slice`.

### E-11. `CafeInfo` `FileReader` no cleanup
- **Location:** `frontend/src/components/Authentication/components/Registration/CafeInfo.jsx:18`
- **Severity:** medium
- **Issue:** `reader.onloadend` calls `setLogoPreview` without unmount guard. If component unmounts before read completes, setState on unmounted component.
- **Fix:** Use a `mounted` ref or AbortController.

### E-12. `ProfileManagement` `FileReader` same issue
- **Location:** `frontend/src/components/ProfileManagement/ProfileManagementIndex.jsx:62-69`
- **Severity:** medium
- **Fix:** Same as E-11.

### E-13. `ReusableFormField` `decryptAESFunction` prop is callable-but-defaulted-to-`{}`
- **Location:** `frontend/src/common/Form/ReusableFormField.jsx:43, 77`
- **Severity:** medium
- **Issue:** Default is `{}` (object), but the code calls `decryptAESFunction(field?.value)`. TypeError: `decryptAESFunction is not a function` if `isencryptAES` is true and the caller didn't pass a function.
- **Fix:** Default to `() => ''` or `undefined` (with a guard).

### E-14. `Card value={categoryId}` non-standard prop
- **Location:** `frontend/src/components/CustomerMenu/components/CustomerMenuViewer.jsx:53, 182`
- **Severity:** low
- **Issue:** `Card` doesn't accept `value`. React warning, forwarded to DOM.
- **Fix:** Remove `value={categoryId}`.

### E-15. `useEffect` in `Registration.jsx` for `useAuthSession.isLoading` only — no error handling
- **Location:** `frontend/src/components/Authentication/components/Registration/Registration.jsx:27`
- **Severity:** medium
- **Issue:** If session check fails, user sees a loader forever.
- **Fix:** Surface error or fall through to the form.

### E-16. `LoginWithOTP` `resendTimer` initial value is `10`, not `60`
- **Location:** `frontend/src/components/Authentication/components/LoginWithOTP.jsx:22`
- **Severity:** **high** (likely typo)
- **Issue:** `useState(10)` instead of `useState(RESEND_SECONDS)`. User can resend OTP every 10s instead of 60s.
- **Fix:** `useState(RESEND_SECONDS)`.

### E-17. `Registration.jsx` `-translate-y-[300%]` — magic number
- **Location:** `frontend/src/components/Authentication/components/Registration/Registration.jsx:118`
- **Severity:** low
- **Fix:** Add comment or extract constant.

### E-18. `MenuItem` form `useEffect` for image warning
- **Location:** `frontend/src/components/Menu/MenuItems/components/MenuItemsForm/MenuItemFormFields.jsx:25-27`
- **Severity:** low
- **Issue:** `form.watch('cover_image')` returns new value each call; effect may re-fire spuriously.
- **Fix:** Use callback in `setValue` or `form.formState.dirtyFields`.

### E-19. `QrCodeForm` invalidates query on every close (redundant)
- **Location:** `frontend/src/components/QrCode/components/QrCodeForm/index.jsx:39`
- **Severity:** low
- **Issue:** `handleModalClose` invalidates the QR list query, but the mutation's `onSuccess` already invalidates.
- **Fix:** Remove one.

### E-20. `QrCodeGrid` `printQRCode` clears selection before print fires
- **Location:** `frontend/src/hooks/usePrintQrCodes.js:20`
- **Severity:** low
- **Issue:** `clearSelections()` runs immediately after `print()`. The browser print dialog may not have appeared yet.
- **Fix:** Defer `clearSelections` to after the dialog opens (on user action).

---

## 7. Race Conditions

### RC-1. **Form reset on every `permissions` ref change wipes in-progress edit**
- **Location:** `frontend/src/components/ProfileManagement/ProfileManagementIndex.jsx:42-60`
- **Severity:** **high**
- **Issue:** `useUpdateProfileMutation.onSuccess` invalidates `['client', 'data']` → context refetches `permissions` → `useEffect(..., [permissions])` re-fires `form.reset(...)` → user's in-progress edit (e.g. a new logo they haven't saved) is wiped.
- **Fix:** Compare prev `permissions` ref or skip reset when `isEditing` is true. Use a stable id (e.g. `permissions?.unique_id`) as dep.

### RC-2. **`useEffect` deps missing `error` — template-data error toasts never fire**
- **Location:** `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateEditorIndex.jsx:81-93`
- **Severity:** **high**
- **Issue:** Effect deps are `[categoryError, menuItemError]`; `error` is referenced but not listed. The `if (error) toastError(...)` branch never re-fires when `error` changes.
- **Fix:** Add `error` to deps.

### RC-3. No double-submit guard on `submitOrder`
- **Location:** `frontend/src/contexts/order-management-context.jsx:157`
- **Severity:** high
- **Issue:** `submitOrder` only checks `state.orderItems.length === 0`; doesn't check `state.isSubmitting`. Two fast clicks can both pass the gate.
- **Fix:** `if (state.isSubmitting) return;` at the top. Use `AbortController` for unmount cancellation.

### RC-4. `submitOrder` doesn't use `handleApiError`
- **Location:** `frontend/src/contexts/order-management-context.jsx:171-213`
- **Severity:** high
- **Issue:** Bypasses the service layer pattern. Errors aren't normalized; combined with broken `toast()` (see CRIT-2), user gets no feedback.
- **Fix:** Move to `service/orders.service.js` using try/catch/handleApiError.

### RC-5. `useMutation` chained in `PrivateRoutes.onSuccess` — second is fire-and-forget
- **Location:** `frontend/src/common/PrivateRoutes.jsx:21, 32-40, 46`
- **Severity:** medium
- **Issue:** When session check succeeds, `clientDataGetMutation.mutate()` is fired. Its `onError` only logs. Slow permissions fetch holds the loader indefinitely.
- **Fix:** Render `<Outlet />` immediately on session success; load permissions in parallel without blocking the outlet.

### RC-6. `PrivateRoutes` StrictMode double-fire
- **Location:** `frontend/src/common/PrivateRoutes.jsx:42-44`
- **Severity:** medium
- **Issue:** `useEffect(() => { userCheckMutation.mutate(); }, [])` fires twice in StrictMode. Second run races the first's `onSuccess`.
- **Fix:** Use `useQuery` or a `ran` ref.

### RC-7. `nav('/login')` inside `onError` is redundant with `<Navigate replace>`
- **Location:** `frontend/src/common/PrivateRoutes.jsx:25`
- **Severity:** low
- **Fix:** Drop the imperative call; rely on `<Navigate replace>`.

### RC-8. `MenuItemsIndex` modal opens but `selectedRow` is null → `RowDetailsModal` `data={null}` is partially handled
- **Location:** `frontend/src/components/Menu/MenuItems/components/MenuItemsTable/index.jsx:158-163`
- **Severity:** low
- **Issue:** `data={selectedRow || {}}` — passes empty object when no row is selected. Modal renders with no entries. Cosmetic.
- **Fix:** `<RowDetailsModal isOpen={!!selectedRow} ... />` instead of `isOpen={selectedRow !== null}`.

### RC-9. `useEffect` for `permissions` reads via unstable object ref
- **Location:** `frontend/src/components/ProfileManagement/ProfileManagementIndex.jsx:53` and others
- **Severity:** high (covered in RC-1)
- **Fix:** Use stable id.

### RC-10. `CustomerMenuViewer` `setTimeout` for `renderBatch` increment
- **Location:** `frontend/src/components/CustomerMenu/components/CustomerMenuViewer.jsx:160-167`
- **Severity:** N/A — cleanup returns `clearTimeout`. OK.

### RC-11. `useUpdateProfileMutation` invalidates the same query the form watches
- **Location:** `frontend/src/components/ProfileManagement/ProfileManagementIndex.jsx:46`
- **Severity:** high (same as RC-1)
- **Fix:** Don't invalidate until after navigation/UI stability, or use a ref to skip the next effect run.

---

## 8. Unused Code

### U-1. Commented-out JSX blocks
- **Locations:**
  - `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateItems.jsx:199`
  - `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateMenuViewerLayout.jsx:166-170`
  - `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateSideBarTabs.jsx:35-37, 64-71`
  - `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateStyling.jsx:135-149, 174-190`
  - `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateGlobal.jsx:142-151`
  - `frontend/src/components/Authentication/components/Login.jsx`, `Registration.jsx`, `CustomerMenuViewer.jsx` (verified cleaned in batch 6 — OK)
  - `frontend/src/components/CustomerMenu/components/OrderDrawer.jsx:55` (legitimate TODO — keep)
  - `frontend/src/utils/api.js:5, 13` — `// console.log(...)` and `// export const socket = io(SOCKET_URL);`
  - `frontend/src/common/Table/DataTableViewOptions.jsx:33, 38, 49` — three commented lines including a `{console.log(...)}` placeholder
  - `frontend/src/common/Table/DataTableFacetedFilter.jsx:112` — `{/* <CommandSeparator /> */}`
- **Severity:** low
- **Fix:** Remove per ticket 14's "no commented-out code" rule.

### U-2. `DataTableViewOptions.jsx` is exported but has zero importers
- **Location:** `frontend/src/common/Table/DataTableViewOptions.jsx`
- **Severity:** low
- **Fix:** Delete the file (batch 6 handoff notes "kept for future column-toggle needs" — YAGNI).

### U-3. `usePrintQrCodes` returns `printDialogOpen` and `setPrintDialogOpen` no one uses
- **Location:** `frontend/src/hooks/usePrintQrCodes.js:6`
- **Severity:** low
- **Fix:** Remove the unused state from the hook return.

### U-4. `PermissionsContext` exposes `setLoading` no consumer reads
- **Location:** `frontend/src/contexts/PermissionsContext.jsx:17`
- **Severity:** low
- **Fix:** Remove `setLoading` from the context value.

### U-5. `menuItems.service.js:32` uses `response?.data` while peers use `response.data`
- **Location:** `frontend/src/service/menuItems.service.js:32`
- **Severity:** low
- **Fix:** `return response.data;` for consistency.

### U-6. `TemplateContext` exposes setState functions in context value
- **Location:** `frontend/src/contexts/TemplateContext.jsx:75`
- **Severity:** low
- **Issue:** `setX` functions are stable refs; including them in the value is dead weight.
- **Fix:** Drop `setX` from the context value.

### U-7. `SOCKET_URL` and `toast` from `react-toastify` unused in `api.js`
- **Location:** `frontend/src/utils/api.js:2, 8`
- **Severity:** low
- **Fix:** Remove unused imports.

### U-8. Stale comment in `order-management-context.jsx:1`
- **Location:** `frontend/src/contexts/order-management-context.jsx:1`
- **Severity:** low
- **Fix:** Remove dev-notes comment.

### U-9. `console.log` in `OrderHistoryProvider`
- **Location:** `frontend/src/contexts/order-management-context.jsx:247`
- **Severity:** low
- **Fix:** Remove.

### U-10. `console.log` placeholder in `DataTableViewOptions.jsx`
- **Location:** `frontend/src/common/Table/DataTableViewOptions.jsx:38` (commented)
- **Severity:** low
- **Fix:** Remove.

### U-11. `toast`, `SOCKET_URL`, and the `useEffect` import in `api.js` are dead
- **Location:** `frontend/src/utils/api.js:2, 8` (already noted)
- **Severity:** low

### U-12. Trailing semicolon inconsistency in services
- **Location:** `frontend/src/service/menuItems.service.js:6, 32`; `frontend/src/service/tableQrcode.service.js:6, 14, 23, 32`; `frontend/src/service/customerMenu.service.js:7`; `frontend/src/service/subscription.service.js:6`
- **Severity:** low
- **Fix:** Run prettier.

---

## 9. Duplicate Logic

### DUP-1. `formatError` defined in 3 places
- **Location:** `frontend/src/components/Authentication/components/LoginWithOTP.jsx:11-16`, `LoginWithPassword.jsx:15-20`, `ResetPassword.jsx` (verify)
- **Severity:** low
- **Fix:** Move to `utils/formatError.js` or use `error?.err?.message` directly.

### DUP-2. `visibleHandler` defined in 2 places
- **Location:** `frontend/src/components/CustomerMenu/components/menuStyles.js:4` and `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateEditorIndex.jsx:36-42`
- **Severity:** low
- **Fix:** Import from one location.

### DUP-3. `isMobileDevice` defined in `TemplateMenuViewerLayout.jsx` while `useIsMobile` hook exists
- **Location:** `frontend/src/components/Menu/Templates/components/TemplateEditor/TemplateMenuViewerLayout.jsx:342-344` vs `frontend/src/hooks/use-mobile.js`
- **Severity:** low
- **Fix:** Use `useIsMobile()`.

### DUP-4. `ColorPicker` in `TemplateGlobal.jsx` and `TemplateStyling.jsx`
- **Severity:** low
- **Fix:** Extract a shared `ColorPicker` component.

### DUP-5. Status `Chip` cell pattern (active/inactive, in stock/out of stock)
- **Location:** `CategoriesColumns.jsx`, `MenuItemsColumns.jsx`, and inline in other places
- **Severity:** low
- **Issue:** Ticket 14 called for a single `StatusBadge`, but only `VegStatusBadge` exists in `@/common/StatusBadge.jsx`. The "active/inactive" badge is inlined.
- **Fix:** Extend `common/StatusBadge.jsx` to support a generic status badge (color + label + icon), or create a separate `<StatusChip>` shared component.

### DUP-6. `getCacheStats` defined in 2 places
- **Location:** `frontend/src/utils/cacheDebugger.js:8-21` and `frontend/src/utils/serviceWorkerRegistration.js:97-113`
- **Severity:** low
- **Fix:** Have one delegate to the other.

### DUP-7. `permissionsToFormValues` only in `ProfileManagement/constants/profile.constants.js`
- **Severity:** low
- **Issue:** If a future "admin edit" module needs the same mapping, it'll duplicate.
- **Fix:** Move to `common/` if a second caller appears (YAGNI for now).

### DUP-8. `queryKeyLoopUp` used in 3 places, `authQueryKeys` separately
- **Location:** `frontend/src/components/Menu/Categories/utils.js` (deleted in batch 5), `MenuItemForm.jsx`, `MenuItemsIndex.jsx`, `CategoriesForm.jsx`, `CategoriesIndex.jsx`
- **Severity:** low
- **Fix:** Standardize on a single `queryKeys` pattern across modules.

### DUP-9. `useEffect` for resetting forms on modal open
- **Location:** `useMenuItemsForm.js`, `useCategoriesForm.js`, `useFeedbackForm.js`
- **Severity:** low
- **Issue:** Each `useForm` hook repeats the same `useEffect` for `form.reset`.
- **Fix:** A shared `useResetFormOnOpen(form, deps, defaultValues)` hook would help, but YAGNI until the third copy moves.

### DUP-10. `useEffect` for image warning in `MenuItemFormFields`
- **Severity:** low
- **Fix:** Could be folded into `useMenuItemsForm`.

### DUP-11. `optimistic update` in two `useClientSupportData` mutations
- **Location:** `frontend/src/components/ClientSupport/hooks/useClientSupportData.js:65-78, 85-98`
- **Severity:** low
- **Fix:** Extract a shared optimistic update helper.

### DUP-12. `AuthConstants` location-queries import
- **Location:** `frontend/src/components/ProfileManagement/hooks/useLocationQueries.js:3` imports `authQueryKeys` from `Authentication/constants/auth.constants`
- **Severity:** low
- **Issue:** Cross-module dep. Rename of `authQueryKeys` would silently break.
- **Fix:** Local `locationQueryKeys` constant.

---

## 10. Possible Regressions

### RGR-1. **`<Navigate to="/dashboard" replace />` redirects to non-existent top-level route**
- **Location:** `frontend/src/routes/FeedbackRoutes.jsx:28`
- **Severity:** **high**
- **Issue:** Unknown `/ticket-management/*` paths redirect to `/dashboard`, not to `/ticket-management/dashboard`. Combined with `App.jsx:42`'s catch-all `<Navigate to="/" replace />` (no `/` handler), this creates a redirect loop.
- **Fix:** `<Navigate to="dashboard" replace />` (relative).

### RGR-2. **`App.jsx` `path="*"` redirects to `/` which has no handler**
- **Location:** `frontend/src/App.jsx:42` and `App.jsx:32-34`
- **Severity:** medium
- **Issue:** Catch-all `<Navigate to="/" replace />` → no `path="/"` route → catch-all fires again. Loop.
- **Fix:** Add `<Route index element={<DashboardIndex />} />` inside the `PrivateRoutes` parent (or have `path="*"` go to `/login` when unauthenticated and to a 404 page otherwise).

### RGR-3. **`/menu` (no params) is mounted and likely crashes if `useParams()` reads `undefined`**
- **Location:** `frontend/src/App.jsx:25`
- **Severity:** low
- **Issue:** `<Route path="/menu" element={<CustomerMenuIndex />} />` renders without `restaurantId`/`tableId`. `CustomerMenuIndex` calls `useCustomerMenuTemplate(restaurantId, tableId)` with `undefined` → `getMenuForCustomerByTableId({ tableId: undefined, userId: undefined })` → `authApi.get('/customer-menu/template/undefined/undefined')` → 404.
- **Fix:** Guard in component: `if (!restaurantId || !tableId) return <ErrorState />`. Or remove the route.

### RGR-4. **`MenuItemsIndex` `onView={() => {}}` is a no-op**
- **Location:** `frontend/src/components/Menu/MenuItems/MenuItemsIndex.jsx:92`
- **Severity:** medium
- **Issue:** The View button does nothing. RowDetailsModal is wired in `MenuItemsTable`'s local state, not propagated up.
- **Fix:** Pass `setSelectedRow` to the table, or remove the button.

### RGR-5. **`submitOrder` is a no-op stub in `OrderDrawer`**
- **Location:** `frontend/src/components/CustomerMenu/components/OrderDrawer.jsx:54-56`
- **Severity:** high
- **Issue:** `handlePlaceOrder` is a stub with a comment "order placement disabled until /api/order endpoint is wired". Place Order button is non-functional. Note: the context's `submitOrder` IS implemented (batches 5/6) but not wired in. Check whether `OrderDrawer` calls `submitOrder` from `useOrder()` or has a no-op.
- **Fix:** Wire `handlePlaceOrder` to call `submitOrder` from `useOrder()`.

### RGR-6. **No `delete` calls in `menuItems.service.js` and `tableQrcode.service.js`**
- **Location:** `frontend/src/service/menuItems.service.js`, `frontend/src/service/tableQrcode.service.js`
- **Severity:** low
- **Issue:** If any UI tries to delete, it must be calling raw axios. (Grep didn't find any, so likely YAGNI.)
- **Fix:** Add `deleteMenuItem` and `deleteQrCode` only when a UI needs them.

### RGR-7. **`'Geist Sans Variable'` web font not referenced by Tailwind**
- **Location:** `frontend/tailwind.config.js:11` (covered in R-11)
- **Severity:** medium
- **Fix:** Use the actual family name.

### RGR-8. **`MenuCardFilters` → `MenuItemFilters` rename is a breaking change for any missed caller**
- **Severity:** low
- **Fix:** Verified by batch 5 handoff (re-grep if any).

### RGR-9. **`templateQueryKeyLoopUp` → `templateQueryKeys` rename**
- **Severity:** low
- **Fix:** Verified by batch 5 handoff (re-grep if any).

### RGR-10. **`customerMenuQueryKeys.TEMPLATE` etc. added; verify `customerMenuQueryKeys.MENU_ITEMS` and `customerMenuQueryKeys.CATEGORY` keys are correct (the constant seems to mix labels and values)**
- **Location:** `frontend/src/components/CustomerMenu/constants/customerMenu.constants.js`
- **Severity:** medium
- **Issue:** `useCustomerMenuCategories` uses `queryKey: [customerMenuQueryKeys.MENU_ITEMS, restaurantId]` but the hook name says "Categories". And `useCustomerMenuItems` uses `queryKey: [customerMenuQueryKeys.CATEGORY, restaurantId]`. The constant keys are swapped from the hook names.
- **Fix:** Verify the constant names match the data they key. (e.g. `customerMenuQueryKeys.CATEGORIES` for categories, `customerMenuQueryKeys.MENU_ITEMS` for items.)

### RGR-11. **Lazy state init / module-level state in `PermissionsProvider`**
- **Location:** `frontend/src/contexts/PermissionsContext.jsx`
- **Severity:** N/A (already audited)
- **Note:** Verify context value memoization is correct (covered in PERF-3).

### RGR-12. **`<TabsContent value="...">` outside a `<Tabs>` parent**
- **Location:** `frontend/src/routes/MenuRoutes.jsx:15-22, 39-54`
- **Severity:** low
- **Issue:** Each child route renders `<TabsContent value="...">`. This is a Radix pattern that only matters when those children are mounted inside a `<Tabs>` instance. If `MenuIndex` doesn't actually mount a `<Tabs>`, the `value` prop does nothing.
- **Fix:** Verify `MenuIndex` renders `<Tabs>` around `<Outlet />`. If not, the `TabsContent` wrappers are dead ceremony and can be inlined. (`FeedbackRoutes` is fine — `ClientSupportIndex` does mount `<Tabs>`.)

### RGR-13. **`auth.service.js` `checkUserSession` uses wrong axios instance**
- **Location:** `frontend/src/service/auth.service.js:65` (covered in SEC-8)
- **Severity:** low
- **Fix:** Use `authApi`.

### RGR-14. **`App.css` name lies — only contains scrollbar styles**
- **Location:** `frontend/src/App.css`
- **Severity:** low
- **Fix:** Rename to `scrollbar.css`; move import to `main.jsx`.

### RGR-15. **No dark-mode toggle in entry layer**
- **Location:** `frontend/tailwind.config.js:3`
- **Severity:** low
- **Issue:** `darkMode: ['class']` but no `dark` class toggle logic in `main.jsx` or `App.jsx`. Verify it exists elsewhere; if not, dark-mode config is dead.
- **Fix:** Confirm a theme toggle exists.

### RGR-16. **`<Catch-all path="*">` outside the protected block**
- **Location:** `frontend/src/App.jsx:42`
- **Severity:** medium
- **Issue:** Unauthenticated users on unknown URLs are bounced to `/` (no handler) rather than to `/login`. Combined with #RGR-2, this is broken.
- **Fix:** Move `*` inside the protected block, add a top-level `*` → `/login` for unauth.

---

## 11. Cross-Cutting (regression summary)

| Concern | Status |
|---------|--------|
| Route paths corrected (no `tamplate`/`ClinetSupport`) | OK — verified in batch 6 |
| `@/` alias used for cross-directory imports | OK — all routing-layer files use `@/`; no `../../` in App-level files |
| App.jsx layout vs URL-path-split | Uses proper layout routes (correct) |
| Protected → `/login` redirect | Works (`PrivateRoutes.jsx:54`) |
| Public `/menu/:restaurantId/:tableId` | Yes (`App.jsx:26`) — but `/menu` no-params also mounts (RGR-3) |
| Restricted `/login`, `/register-user`, `/reset-password` | Yes (`App.jsx:28-30`) |
| Nested `menu-management/*` and `ticket-management/*` | Yes — but `FeedbackRoutes` catch-all bug (RGR-1) |
| Service files camelCase | OK |
| Services use `api`/`authApi` (no raw `fetch`) in `/service/` | OK — but `order-management-context` calls `authApi` directly bypassing the service pattern (RC-4) |
| Services return `response.data` | OK — one inconsistency in `menuItems.service.js:32` (U-5) |
| Services follow `try/catch + handleApiError` | OK |
| `utils/api.js` 401 handler | Present, but bugs (SEC-5, SEC-6, SEC-7) |
| `order-management-context.jsx` uses axios (not raw `fetch`) | OK — uses `authApi.post` (covered in RC-4) |
| `formatFileSize` single implementation in `utils/file.utils.js` | OK — only one definition, two consumers |
| `StatusBadge.jsx` is single, named export (`VegStatusBadge`) | OK — only one definition, 4 consumers |
| `InlineSelector`, `CommonTable`, `CommonTableToolbar`, `ReusableFormField`, `RowDetailsModal` are named exports | OK |
| `DataTableFacetedFilter`, `DataTableViewOptions` PascalCase naming | OK — exported as `DataTable*` (PascalCase) |
| `ReusableFormField` used by all form modules | OK |
| `CommonTable` used by all table modules | OK |
| `CommonTableToolbar` reused | OK |
| `process.env.NODE_ENV` removed | OK — all `import.meta.env.DEV` |
| `useEffect` for fetching | OK — TanStack Query throughout |
| `StatusBadge` from `@/common/StatusBadge` | OK for veg/non-veg; "active/inactive" status still inlined (DUP-5) |

---

## 12. Recommendations (next batch)

1. **Batch 7 (URGENT):** Fix critical issues #CRIT-1, #CRIT-2, #RC-2, #RC-1, #PERF-1, #PERF-2, #E-1, #R-1, #R-3, #RGR-1, #SEC-5, #SEC-6.
2. **Batch 8:** Address remaining high-severity items (mutation safety, XSS, FormReader cleanups, StrictMode dedup).
3. **Batch 9 (Polish):** TypeScript for the `ReusableFormField` switch, route-level `React.lazy`, prop-types or TS migration to clear the 1500+ pre-existing lint errors.
4. **Batch 10 (PWA):** Ticket 18 — service worker cleanup, `onUpdate` toast + reload button.

---

## Acceptance Verdict

**Status: ❌ REJECT** — 3 critical bugs are user-facing and would block release. Specifically:

- **SEC-1**: refresh token in request header
- **CRIT-2**: broken `toast()` shape in order context (every customer-side toast silently fails)
- **RGR-1**: catch-all redirect loop in `FeedbackRoutes`

Plus 9 high-severity issues that should be fixed in the same release.

The migration is structurally sound — folder layout, named exports, single sources of truth, all the consolidation goals are achieved. The remaining issues are correctness bugs introduced or surfaced during the consolidation, not design failures.
