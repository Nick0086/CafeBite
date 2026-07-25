# 07 — Migrate QrCode module

**What to build:** The Table-QrCode module is renamed to QrCode, all files follow PascalCase naming, the broken getFormSchema() call is fixed, the env var typo is corrected, and the module conforms to the cafebite-frontend standard folder structure.

**Blocked by:** 01 — Fix critical runtime bugs, 02 — Remove redundant dependencies

**Status:** ready-for-agent

- [ ] Rename directory from Table-QrCode/ to QrCode/
- [ ] Rename table-qrcodeIndex.jsx to QrCodeIndex.jsx (module entry point)
- [ ] Rename table-qrcodeForm.jsx to QrCodeForm/index.jsx (form folder with FormFields + FormFooter)
- [ ] Rename table-qrcodeToolBar.jsx to QrCodeToolbar.jsx inside components/
- [ ] Create components/QrCodeTable/ folder (index + Columns + RowActions)
- [ ] Create hooks/ — move existing hooks (usePrintQrCodes, useQrCodeSelection) here, create useQrCodeData.js for TanStack Query
- [ ] Create constants/qrcode.constants.js
- [ ] Create validation/qrcode.schema.js — extract and fix the broken getFormSchema() call (define the actual zod schema)
- [ ] Fix VITE_BSSE_FRONTEND_URL typo to VITE_BASE_FRONTEND_URL in QrCodeGrid.jsx
- [ ] Replace inline styles with Tailwind classes (QrCodeGrid.jsx:93)
- [ ] Consolidate modal state into single object { open, mode, data }
- [ ] Update all imports across the codebase that reference the old Table-QrCode path
- [ ] Update route paths in App.jsx for the renamed module
- [ ] Verify QR code generation, management, and printing all work correctly
