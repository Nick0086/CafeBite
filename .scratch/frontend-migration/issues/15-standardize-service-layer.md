# 15 — Standardize service layer

**What to build:** All service files follow consistent camelCase naming, all function names are spelled correctly, all use the api axios instance (no raw fetch), and all follow the uniform try/catch + handleApiError pattern.

**Blocked by:** 04 — Migrate Dashboard module, 05 — Migrate Sidebar module, 06 — Migrate Authentication module, 07 — Migrate QrCode module, 08 — Migrate ProfileManagement module, 09 — Migrate CustomerMenu module, 10 — Migrate ClientSupport module, 11 — Migrate Menu parent + Categories, 12 — Migrate Menu/MenuItems, 13 — Migrate Menu/Templates

**Status:** ready-for-agent

- [ ] Rename clinetFeedback.service.js to clientFeedback.service.js
- [ ] Rename table-qrcode.service.js to tableQrcode.service.js (consistent camelCase)
- [ ] Rename customer-menu.service.js to customerMenu.service.js (consistent camelCase)
- [ ] Rename menuItems.service.js to menuItems.service.js (already correct, verify)
- [ ] Fix updateClinetProfile function name to updateClientProfile in user.service.js
- [ ] Fix any other misspelled function names across all service files
- [ ] Ensure order-management-context.jsx uses the api axios instance instead of raw fetch('/api/orders')
- [ ] Verify all service functions follow the uniform try/catch + handleApiError pattern
- [ ] Verify all service functions return response.data (not full response)
- [ ] Verify no React dependencies in service files
- [ ] Update all imports across the codebase that reference renamed service files
- [ ] Verify all API calls work correctly after renaming
- [ ] Verify error handling works correctly for all API calls
