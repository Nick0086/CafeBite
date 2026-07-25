# 01 - Folder Structure

> Best practices from React, Shadcn/ui, and Vite official documentation.

---

## Sources

- [Shadcn/ui - Vite Installation](https://ui.shadcn.com/docs/installation/vite)
- [Vite Path Aliases](https://vitejs.dev/config/shared-options.html#resolve-alias)
- [React - File Structure](https://react.dev/learn/start/build-a-react-app)
- [bulletproof-react - Project Structure](https://github.com/alan2207/bulletproof-react)

---

## Top-Level Structure

```
frontend/
├── public/                          # Static assets served as-is
│   ├── favicon.svg
│   └── images/
│
├── src/                             # All source code
│   ├── main.jsx                     # Entry point: ReactDOM, providers
│   ├── App.jsx                      # Root component: routes
│   ├── index.css                    # Global styles, Tailwind directives
│   │
│   ├── components/                  # Feature modules (by domain)
│   │   ├── ui/                      # Shadcn primitives (button, dialog, ...)
│   │   ├── layouts/                 # Shared layouts (sidebar, header)
│   │   ├── <Module>/                # Feature module
│   │   └── ...
│   │
│   ├── pages/                       # OPTIONAL: route pages (alternative to components/<Module>)
│   │
│   ├── service/                     # API service layer (one file per module)
│   │   ├── auth.service.js
│   │   ├── categories.service.js
│   │   └── ...
│   │
│   ├── hooks/                       # Reusable custom hooks
│   │   ├── use-toast.js
│   │   └── ...
│   │
│   ├── contexts/                    # React Context providers
│   │   ├── PermissionsContext.jsx
│   │   └── ...
│   │
│   ├── utils/                       # Pure utility functions
│   │   ├── api.js                   # Axios instance, interceptors
│   │   ├── toast-utils.js
│   │   └── ...
│   │
│   ├── lib/                         # Internal library code
│   │   └── utils.js                 # cn() helper
│   │
│   ├── common/                      # Cross-cutting components
│   │   ├── Form/
│   │   ├── Table/
│   │   └── Modal/
│   │
│   ├── assets/                      # SVGs, images used in JSX
│   ├── routes/                      # Route aggregators
│   │   ├── MenuRoutes.jsx
│   │   └── FeedbackRoutes.jsx
│   │
│   └── styles/                      # CSS modules, global styles
│
├── components.json                  # Shadcn/ui config
├── tailwind.config.js
├── vite.config.js
├── jsconfig.json                    # Path aliases
├── eslint.config.js
└── package.json
```

---

## Path Aliases (Vite + JSConfig)

**Source**: [Vite - resolve.alias](https://vitejs.dev/config/shared-options.html#resolve-alias), [Shadcn/ui - Vite](https://ui.shadcn.com/docs/installation/vite)

`vite.config.js`:
```javascript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

`jsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Reference: Current Project
`frontend/vite.config.js:9-13` - ✅ Correctly configured with `@` alias.

### Alias Usage

```javascript
// ✅ CORRECT - use alias for absolute imports
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { getCategories } from "@/service/categories.service"

// ❌ WRONG - deep relative paths
import { Button } from "../../../components/ui/button"
import { getCategories } from "../../../service/categories.service"
```

---

## Module Folder Convention

**Source**: [bulletproof-react - Feature Structure](https://github.com/alan2207/bulletproof-react), [Shadcn/ui Patterns](https://ui.shadcn.com/docs)

Every feature module follows this structure:

```
components/<ModuleName>/
├── <ModuleName>Index.jsx              # Page entry: orchestrates everything
│
├── components/                       # Module-specific components
│   ├── <Module>Table/                 # ALWAYS a folder
│   │   ├── index.jsx                  # Table assembly + state
│   │   ├── <Module>Columns.jsx        # Column defs + cell renderers
│   │   ├── <Module>RowActions.jsx     # Edit → Delete → Info buttons
│   │   └── <Module>Toolbar.jsx        # Filters, bulk actions
│   │
│   ├── <Module>Form/                  # ALWAYS a folder
│   │   ├── index.jsx                  # Dialog wrapper + submit logic
│   │   ├── <Module>FormFields.jsx     # All input fields
│   │   └── <Module>FormFooter.jsx     # Submit / Cancel buttons
│   │
│   ├── <Module>DeleteDialog.jsx       # Single file (small, focused)
│   └── <Module>InfoPanel.jsx          # Single file (or folder if has tabs)
│
├── hooks/                            # Module-specific hooks
│   ├── use<Module>Data.js             # React Query hooks
│   ├── use<Module>Form.js             # Form state (RHF)
│   └── use<Module>Filter.js           # Filter state
│
├── constants/
│   └── <module>.constants.js          # Options, enums, labels
│
├── validation/
│   └── <module>.schema.js             # Zod schemas
│
└── utils.js                          # Module-specific helpers
```

### Component → Sub-Folder Decision Rule

```
Component > ~150 lines?              → folder with index.jsx
Defines internal sub-components?     → folder with index.jsx
Has 2+ distinct UI sections?         → folder with index.jsx
Otherwise                            → single file is fine
```

### Always a Folder (Regardless of Size)

| Component | Why |
|-----------|-----|
| `<Module>Table/` | Always needs Columns + RowActions as separate files |
| `<Module>Form/` | Always needs FormFields + FormFooter split |
| `<Module>FilterModal/` | Always needs modal shell + form split |

---

## File Naming Rules

**Source**: Industry convention, [Shadcn/ui Conventions](https://ui.shadcn.com/docs/components)

| What | Convention | Example |
|------|-----------|---------|
| Page entry | `index.jsx` | `<Module>/index.jsx` |
| Component folder | PascalCase | `<Module>Table/` |
| Component entry | `index.jsx` inside folder | `<Module>Table/index.jsx` |
| Sub-components | PascalCase + descriptive suffix | `<Module>Columns.jsx`, `<Module>RowActions.jsx` |
| Hooks | camelCase with `use` prefix | `useCategories.js` |
| Constants | camelCase + `.constants.js` | `category.constants.js` |
| Validation schema | camelCase + `.schema.js` | `category.schema.js` |
| Service | camelCase + `.service.js` | `categories.service.js` |
| Context | PascalCase + `Context` suffix | `PermissionsContext.jsx` |
| Util | camelCase | `cn.js` |

---

## Service Layer Convention

**Source**: [bulletproof-react - API Layer](https://github.com/alan2207/bulletproof-react)

`src/service/<module>.service.js` - one file per backend module:

```
src/service/
├── auth.service.js              # → /v1/auth/*
├── categories.service.js        # → /v1/category/*
├── menuItems.service.js         # → /v1/menu/*
├── templates.service.js         # → /v1/template/*
├── table-qrcode.service.js      # → /v1/tables/*
├── customer-menu.service.js     # → /v1/customer-menu/*
├── clinetFeedback.service.js    # → /v1/feedback/*
├── subscription.service.js      # → /v1/subscription/*
├── user.service.js              # → /v1/client/*
└── common.service.js            # → /v1/common/*
```

---

## Import Order (Industry Convention)

**Source**: [bulletproof-react - Import Order](https://github.com/alan2207/bulletproof-react)

```javascript
// 1. External packages
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'

// 2. Internal absolute (@/ alias)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { getCategories } from '@/service/categories.service'
import { cn } from '@/lib/utils'

// 3. Relative imports
import { CategoryForm } from './components/CategoryForm'

// 4. Types (if TypeScript)
// import type { Category } from './types'

// 5. Styles
import './styles.css'
```

---

## Component Hierarchy in This Project

```
src/components/
├── ui/                            # Shadcn primitives (don't modify directly)
│   ├── button.jsx
│   ├── card.jsx
│   ├── dialog.jsx
│   └── ...
│
├── layouts/                       # Shared layouts
│   ├── Sidebar.jsx
│   └── ...
│
├── Authentication/                # Auth feature
├── Dashboard/                     # Dashboard feature
├── Menu/                          # Menu management (sub-feature container)
│   ├── Categories/                # Category sub-feature
│   ├── MenuItems/                 # Menu items sub-feature
│   └── Templates/                 # Templates sub-feature
├── ClinetSupport/                 # Support tickets
│   ├── dashboard/
│   └── feedback/
├── CustomerMenu/                  # Public customer menu
├── ProfileManagement/             # User profile
├── Sidebar/                       # Sidebar component
└── Table-QrCode/                  # QR code management
```

---

## Common Components vs Module Components

| Type | Location | Rule |
|------|----------|------|
| **Reusable cross-module** | `src/common/` | `CommonTable`, `ReusableFormField` |
| **Module-specific** | `components/<Module>/components/` | Only used in one module |
| **Shadcn primitives** | `components/ui/` | Never modify directly |

**Reference: Current Project**

- `src/common/Table/CommonTable.jsx` - Used across all table modules
- `src/common/Form/ReusableFormField.jsx` - Used across all forms
- `src/common/Modal/RowDetailsModal.jsx` - Used across all "info" panels

---

## Current Project vs Best Practice Comparison

| Aspect | Current State | Best Practice | Action |
|--------|--------------|---------------|--------|
| **Module structure** | Mixed: some use `<Module>Table/` folder, some don't (e.g., `MenuItems/MenuTable.jsx` is single file) | Always folder | New code: use folder pattern |
| **Service location** | `src/service/` (singular folder) | Same | ✅ Correct |
| **Path alias** | `@/*` configured | Same | ✅ Correct |
| **Constants** | Mixed: `Categories/utils.js` contains constants | Separate `constants/` folder | New code: separate folder |
| **Validation** | Some modules have `schema.js` (auth), most don't | Separate `validation/` folder with Zod | New code: separate folder |
| **Hooks** | Mixed: `Table-QrCode/hooks/` exists, others don't | Separate `hooks/` folder per module | New code: separate folder |
| **UI primitives** | `src/components/ui/` (Shadcn) | Same | ✅ Correct |

---

## Checklist for New Module

- [ ] Folder created at `components/<ModuleName>/`
- [ ] `<ModuleName>Index.jsx` at root (the page entry)
- [ ] `components/<Module>Table/` folder with `index.jsx` + `Columns.jsx` + `RowActions.jsx`
- [ ] `components/<Module>Form/` folder with `index.jsx` + `FormFields.jsx` + `FormFooter.jsx`
- [ ] `components/<Module>DeleteDialog.jsx` single file
- [ ] `components/<Module>InfoPanel.jsx` single file (or folder if tabs)
- [ ] `hooks/use<Module>Data.js` - React Query hooks
- [ ] `hooks/use<Module>Form.js` - RHF setup
- [ ] `constants/<module>.constants.js` - enums, options
- [ ] `validation/<module>.schema.js` - Zod schemas
- [ ] `utils.js` - module-specific helpers
- [ ] `service/<module>.service.js` - API calls
- [ ] Registered in `routes/<Module>Routes.jsx` and `App.jsx`
- [ ] All imports use `@/` alias for absolute paths
- [ ] All imports follow the 5-level order (external → internal → relative → types → styles)
