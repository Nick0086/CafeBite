# Test Plan: Tickets 01 & 02

**Scope:** Critical runtime bug fixes + redundant dependency removal  
**Date:** 2026-07-26  
**Tester:** [Name]  
**Environment:** Development / Staging / Production

---

## Pre-Flight Checks

Before testing, verify:
- [ ] `npm install` completes without errors
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without console errors
- [ ] Application loads at http://localhost:5173 (or configured port)

---

## Ticket 01: Runtime Bug Fixes (10 Tests)

### 1.1 Sidebar Hooks Fix

**Bug:** `useLocation()` called after conditional return violated Rules of Hooks  
**File:** `src/components/Sidebar/Sidebar.jsx:66`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as any user | Sidebar renders without React error |
| 2 | Navigate to `/menu-management` | Sidebar highlights "Menu" link |
| 3 | Navigate to `/qr-management` | Sidebar highlights "Qr Code" link |
| 4 | Navigate to `/profile-management` | Sidebar highlights "Profile" link |
| 5 | Navigate to `/menu/tamplate-editor` (fullscreen route) | Sidebar hidden, template editor shows |

**Console check:** No "Rendered more hooks than during the previous render" error

---

### 1.2 QR Code Form Schema Fix

**Bug:** `getFormSchema()` was undefined, causing runtime crash  
**File:** `src/components/Table-QrCode/table-qrcodeForm.jsx:16`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/qr-management` | Page loads without crash |
| 2 | Click "Create QR Code" button | Modal opens with form |
| 3 | Leave fields empty, click "Save" | Validation errors: "Qr Code Name is required", "Template is required" |
| 4 | Fill form with valid data | Form submits successfully |
| 5 | Edit existing QR code | Form pre-populates, updates work |

**Console check:** No `ReferenceError: getFormSchema is not defined`

---

### 1.3 Blob Health Check Import Fix

**Bug:** `imageCache` was used but never imported  
**File:** `src/utils/blobHealthCheck.js:1`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open browser DevTools console | No `ReferenceError: imageCache is not defined` |
| 2 | Navigate to menu with images | Images load from cache |
| 3 | (If debug exposed) Run `window.blobHealthChecker.validateCacheIntegrity()` in console | Returns stats object, no crash |

**Console check:** No `ReferenceError` on page load

---

### 1.4 Menu Item Form Variable Fix

**Bug:** `categoryName` was undefined, should be `menuItemName`  
**File:** `src/components/Menu/MenuItems/MenuItemForm.jsx:130`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/menu-management/menu-items` | Page loads |
| 2 | Click "Edit" on any menu item | Modal opens with pre-filled data |
| 3 | Change item name to "Test Item" | Name field updates |
| 4 | Click "Submit" | Success toast: "Menu Items : Test Item updated successfully" |

**Console check:** No `ReferenceError: categoryName is not defined`

---

### 1.5 Contact Form Duplicate Field Fix

**Bug:** Twitter handle field was bound to `socialFacebook` (duplicate)  
**File:** `src/components/Authentication/Registration/Contact.jsx:55`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/register-user` | Registration form loads |
| 2 | Complete steps 1-3 (Personal, Cafe Basic, Location) | Each step validates and advances |
| 3 | Reach step 4 (Contact & Social) | Form shows Instagram, Facebook, Twitter fields |
| 4 | Enter "testinsta" in Instagram field | Value stored |
| 5 | Enter "testfb" in Facebook field | Value stored |
| 6 | Enter "testtwitter" in Twitter field | Value stored (not overwriting Facebook) |
| 7 | Submit registration | All 3 social fields saved correctly |

**Verification:** Check network request payload — `socialFacebook: "testfb"`, `socialTwitter: "testtwitter"` (separate fields)

---

### 1.6 Menu Index Return Statement Fix

**Bug:** Conditional JSX block had no `return`, so tabs never hid  
**File:** `src/components/Menu/MenuIndex.jsx:29`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/menu-management/tamplate` | Tabs visible (Templates, Categories, Menu Items) |
| 2 | Click "Templates" tab | Tab switches, content updates |
| 3 | Navigate to `/menu-management/tamplate-editor` | Tabs hidden, only editor shows |
| 4 | Click browser back button | Tabs reappear |

**Visual check:** Template editor page has no tab bar

---

### 1.7 Vite Environment Variable Fix

**Bug:** `process.env.NODE_ENV` doesn't exist in Vite (should be `import.meta.env.DEV`)  
**Files:** 7 files updated

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Run `npm run dev` | No `process is not defined` error |
| 2 | Run `npm run build` | Build succeeds |
| 3 | Run `npm run preview` | Production build runs without errors |
| 4 | Open menu with images in dev mode | Cache status shows (if enabled) |
| 5 | Open menu with images in production | Cache status hidden |

**Console check:** No `ReferenceError: process is not defined`

---

### 1.8 CSS Double Percent Fix

**Bug:** `--sidebar-background: 0 0% 100%%;` had invalid double percent  
**File:** `src/index.css:64`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open app in light mode | Sidebar has white background |
| 2 | Inspect sidebar element in DevTools | `background-color` resolves to `rgb(255, 255, 255)` |
| 3 | Toggle to dark mode (if implemented) | Sidebar has dark background |

**DevTools check:** No CSS parsing errors for `--sidebar-background`

---

### 1.9 CSS Variable Reference Fix

**Bug:** `--container` variable was undefined in scrollbar track  
**File:** `src/App.css:14`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Scroll any page with overflow | Scrollbar track visible |
| 2 | Inspect `::-webkit-scrollbar-track` in DevTools | `background-color` resolves to `hsl(var(--background))` |
| 3 | Verify scrollbar styling | Track color matches page background |

**DevTools check:** No "invalid property value" for `background-color`

---

### 1.10 Build Verification

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Run `npm run build` | Build completes in ~2 minutes |
| 2 | Check output | `dist/` folder created with assets |
| 3 | Run `npm run preview` | App loads without runtime errors |
| 4 | Navigate all routes | No crashes, no blank pages |

---

## Ticket 02: Dependency Removal (7 Tests)

### 2.1 Moment → date-fns Migration

**Removed:** `moment` package  
**File:** `src/contexts/order-management-context.jsx:4,276`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to customer menu (if accessible) | Page loads |
| 2 | Add item to order | Toast: "Item added" |
| 3 | Check localStorage `order_{restaurantId}_{tableId}` | Keys formatted as `dd-MM-yyyy HH:mm:ss` (e.g., `26-07-2026 14:30:45`) |

**Console check:** No `Cannot find module 'moment'` error

---

### 2.2 Yup → Zod Migration

**Removed:** `yup` package  
**Files:** 9 files converted

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | **Login page** — submit empty form | Errors: "Please enter your email address", "Please enter your password" |
| 2 | **Login page** — enter invalid email | Error: "Invalid email" |
| 3 | **Registration step 1** — submit empty | Errors for firstName, lastName, email, phoneNumber |
| 4 | **Registration step 2** — submit empty | Errors for cafeName, cafeDescription |
| 5 | **Registration step 3** — submit empty | Errors for address, city, state, country, currency, zip |
| 6 | **Registration step 4** — enter invalid email | Error: "Please enter a valid email address" |
| 7 | **Reset password** — submit empty | Errors for password, confirmPassword |
| 8 | **Reset password** — enter mismatched passwords | Error: "Passwords must match" |
| 9 | **Category form** — submit empty | Error: "Category is required" |
| 10 | **Menu item form** — submit empty | Errors for name, description, category, price |
| 11 | **Menu item form** — enter non-numeric price | Error: "Price must be a valid number" |
| 12 | **QR code form** — submit empty | Errors: "Qr Code Name is required", "Template is required" |
| 13 | **Feedback form** — submit empty | Errors for title, description, type |

**Console check:** No `Cannot find module 'yup'` or `yupResolver` errors

---

### 2.3 Motion Package Removal

**Removed:** `motion` package (replaced with `framer-motion`)  
**Files:** 4 loader components updated

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` (before auth) | Pulsating dots loader animates |
| 2 | Navigate to `/register-user` (before auth) | Loader animates |
| 3 | Navigate to `/reset-password?token=...` | Loader animates |
| 4 | Trigger any loading state | Loaders render without crash |

**Console check:** No `Cannot find module 'motion/react'` error

---

### 2.4 Shadcn Toaster Removal

**Removed:** `<Toaster>` from `App.jsx`  
**File:** `src/App.jsx`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Perform any action that triggers toast (e.g., create category) | Toast appears (via `react-toastify`) |
| 2 | Check for duplicate toasts | Only one toast system active |
| 3 | Inspect DOM for `<div data-sonner-toaster>` | Element not present |

**Visual check:** Toasts use `react-toastify` styling (top-right, white background)

---

### 2.5 Services → Lib Directory Rename

**Renamed:** `src/services/` → `src/lib/`  
**Files:** 7 imports updated

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to menu with images | Images load via `ImageCacheService` |
| 2 | Open DevTools → Application → IndexedDB | `CafeBiteImageCache` database exists |
| 3 | Preload images (navigate menu) | Images cached in IndexedDB |

**Console check:** No `Cannot find module '@/services/ImageCacheService'` error

---

### 2.6 "use client" Directive Removal

**Removed:** `"use client"` from `src/hooks/use-toast.js:1`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Trigger any toast notification | Toast displays correctly |
| 2 | Check console for warnings | No "use client directive in non-Next.js project" warning |

---

### 2.7 Bundle Size Verification

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Run `npm run build` | Build completes |
| 2 | Check `dist/assets/index-*.js` size | ~1,725 KB (down from previous) |
| 3 | Check `node_modules` size | Smaller after removing moment (~300KB), yup (~100KB), motion (~200KB) |
| 4 | Run `npm ls moment` | Package not found |
| 5 | Run `npm ls yup` | Package not found |
| 6 | Run `npm ls motion` | Package not found |

**Expected reduction:** ~600KB removed from node_modules

---

## Edge Cases

### E.1 localStorage Disabled

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Disable localStorage in DevTools → Application → Storage | — |
| 2 | Attempt login | App handles gracefully, shows error or falls back to session-only |
| 3 | Check console | No uncaught exceptions |

**Expected:** App doesn't crash; may show "Storage unavailable" message

---

### E.2 API Returns 401

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Clear tokens from localStorage | — |
| 2 | Make any authenticated request | Axios interceptor catches 401 |
| 3 | Check behavior | Tokens cleared, redirect to `/login` |

**Expected:** User logged out, redirected to login page

---

### E.3 Form Validation Fails

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Submit any form with invalid data | Zod validation triggers |
| 2 | Check error messages | Clear, user-friendly messages displayed |
| 3 | Fix errors, resubmit | Form validates and submits |

**Expected:** No console errors, validation messages appear inline

---

### E.4 Image Cache Corrupted

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Manually corrupt IndexedDB (if possible) | — |
| 2 | Navigate to menu with images | Images fall back to network URLs |
| 3 | Check console | Warning logged, no crash |

**Expected:** Graceful degradation to network images

---

## Regression Scenarios

### R.1 Authentication Flow

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login page renders |
| 2 | Login with email + password | Redirect to `/` |
| 3 | Logout | Redirect to `/login`, tokens cleared |
| 4 | Login with OTP | OTP sent, redirect after verification |
| 5 | Refresh page while logged in | Session persists, no redirect to login |
| 6 | Navigate to protected route while logged out | Redirect to `/login` |

---

### R.2 CRUD Operations

#### Categories

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/menu-management/categories` | Table loads |
| 2 | Click "Add Category" | Modal opens |
| 3 | Create category | Success toast, table updates |
| 4 | Edit category | Modal pre-fills, update succeeds |
| 5 | Delete category | Confirmation dialog, delete succeeds |

#### Menu Items

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/menu-management/menu-items` | Table loads |
| 2 | Click "Add Menu Item" | Modal opens |
| 3 | Create menu item (with image) | Success toast, image uploads |
| 4 | Edit menu item | Modal pre-fills, update succeeds |
| 5 | Delete menu item | Confirmation dialog, delete succeeds |

#### Templates

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/menu-management/tamplate` | Table loads |
| 2 | Create template | Success toast |
| 3 | Edit template | Modal pre-fills, update succeeds |
| 4 | Open template editor | Fullscreen view, no sidebar |

#### QR Codes

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/qr-management` | Grid view loads |
| 2 | Click "Create QR Code" | Modal opens |
| 3 | Create QR code | Success toast, QR appears in grid |
| 4 | Edit QR code | Modal pre-fills, update succeeds |
| 5 | Print QR code | Print dialog opens |

#### Feedback

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/ticket-management` | Table loads |
| 2 | Click "Add Ticket" | Modal opens |
| 3 | Create ticket (with attachments) | Success toast, ticket appears |
| 4 | Edit ticket | Modal pre-fills, update succeeds |

---

### R.3 Dark Mode (if implemented)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Toggle dark mode (if available) | Theme switches |
| 2 | Check sidebar background | Dark color applied |
| 3 | Check all pages | No white flashes, colors consistent |

---

### R.4 PWA Service Worker

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open DevTools → Application → Service Workers | SW registered |
| 2 | Check "Update on reload" | SW updates on page refresh |
| 3 | Go offline (DevTools → Network → Offline) | App still loads (cached assets) |

---

## Test Results Summary

| Category | Total | Passed | Failed | Notes |
|----------|-------|--------|--------|-------|
| Ticket 01 Fixes | 10 | | | |
| Ticket 02 Fixes | 7 | | | |
| Edge Cases | 4 | | | |
| Regression | 4 | | | |
| **TOTAL** | **25** | | | |

---

## Sign-Off

- [ ] All critical bugs fixed
- [ ] All dependencies removed successfully
- [ ] No regressions introduced
- [ ] Bundle size decreased
- [ ] Ready for production deployment

**Tester:** _________________  
**Date:** _________________  
**Status:** [ ] PASS  [ ] FAIL
