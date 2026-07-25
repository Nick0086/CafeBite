# Frontend Development Guide

> **CafeBite** - React 18 / Vite / TanStack Query / Shadcn/ui

This guide documents frontend development following **internet best practices** from React, TanStack, React Hook Form, Shadcn/ui, and other authoritative sources. Where the current project deviates from best practice, the target pattern is documented.

---

## Quick Start

```bash
cd frontend
npm install
npm run dev          # Vite dev server
npm run build        # Production build
npm run lint         # ESLint
```

---

## Table of Contents

| # | Guide | What You'll Learn |
|---|-------|-------------------|
| 01 | [Folder Structure](./01-folder-structure.md) | Where every file lives, module conventions |
| 02 | [Routing](./02-routing.md) | React Router v7, nested routes, protected routes |
| 03 | [State Management](./03-state-management.md) | State colocation, Context, server vs UI state |
| 04 | [Data Fetching](./04-data-fetching.md) | TanStack Query, service layer, axios interceptors |
| 05 | [Component Patterns](./05-component-patterns.md) | Hierarchy, composition, container/presentational |
| 06 | [Forms](./06-forms.md) | React Hook Form + Zod, ReusableFormField pattern |
| 07 | [Tables](./07-tables.md) | TanStack Table, columns, filters, sorting, pagination |
| 08 | [UI Conventions](./08-ui-conventions.md) | Buttons, dialogs, toasts, loaders, dates, chips |
| 09 | [Auth Flow](./09-auth-flow.md) | Token storage, route protection, 401 handling, roles |
| 10 | [Best Practices](./10-best-practices.md) | Compiled reference from all internet sources |
| 11 | [Troubleshooting](./11-troubleshooting.md) | Common errors and fixes |

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                       Browser Request                           │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  React Router v7 (declarative routing)                          │
│  - Public routes: /login, /register, /menu/:rid/:tid          │
│  - Private routes: /menu-management/*, /qr-management, ...    │
│  - Layout: Sidebar wraps private routes                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  QueryClientProvider (TanStack Query v5)                        │
│  - Server cache lives in React Query                           │
│  - UI state lives in useState / Context                        │
│  - Rules: staleTime, gcTime, retry, refetchOnWindowFocus       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Pages → Containers → Presentational Components                 │
│  - Page: orchestrator, owns data fetching                      │
│  - Container: business logic, state coordination                │
│  - Presentational: pure UI, receives props                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Service Layer (src/service/*.service.js)                      │
│  - Pure API calls (axios)                                      │
│  - Returns response.data or throws handleApiError              │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend API (CafeBite)                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack (Internet Best Practice Sources)

| Layer | Library | Source |
|-------|---------|--------|
| Build tool | Vite 6 | [vitejs.dev](https://vitejs.dev/) |
| UI Framework | React 18 | [react.dev](https://react.dev/) |
| Routing | React Router 7 | [reactrouter.com](https://reactrouter.com/) |
| Server State | TanStack Query v5 | [tanstack.com/query](https://tanstack.com/query/latest) |
| Tables | TanStack Table v8 | [tanstack.com/table](https://tanstack.com/table) |
| Forms | react-hook-form v7 | [react-hook-form.com](https://react-hook-form.com/) |
| Validation | Zod / Yup | [zod.dev](https://zod.dev/) |
| UI Components | Shadcn/ui (Radix + Tailwind) | [ui.shadcn.com](https://ui.shadcn.com/) |
| Styling | Tailwind CSS 3 | [tailwindcss.com](https://tailwindcss.com/) |
| Icons | Lucide React | [lucide.dev](https://lucide.dev/) |
| HTTP | Axios | [axios-http.com](https://axios-http.com/) |
| Dates | date-fns | [date-fns.org](https://date-fns.org/) |
| Toast | react-toastify | [fkhadra.github.io/react-toastify](https://fkhadra.github.io/react-toastify/) |
| Animation | Framer Motion | [framer.com/motion](https://www.framer.com/motion/) |
| Class utility | clsx + tailwind-merge | [github.com/lukeed/clsx](https://github.com/lukeed/clsx) |

---

## State Categories (Kent C. Dodds Principle)

[Source: kentcdodds.com/blog/application-state-management-with-react](https://kentcdodds.com/blog/application-state-management-with-react)

| State Type | Tool | Example |
|------------|------|---------|
| **Server Cache** | TanStack Query | List of categories, user profile, feedback data |
| **UI State** | useState / useReducer | Modal open/close, form values, active tab |
| **Global UI State** | Context API | Permissions, current user, theme |
| **URL State** | React Router search params | Pagination, filters, sort |
| **Form State** | react-hook-form | Form values, errors, dirty/touched |

> **Golden rule**: Never put server cache in useState. Never put UI state in React Query.

---

## Module Convention

Every feature module follows this structure:

```
src/
├── components/
│   └── <Module>/
│       ├── <Module>Index.jsx         # Page entry
│       ├── components/
│       │   ├── <Module>Table/        # Always a folder
│       │   │   ├── index.jsx
│       │   │   ├── <Module>Columns.jsx
│       │   │   └── <Module>RowActions.jsx
│       │   ├── <Module>Form/         # Always a folder
│       │   │   ├── index.jsx
│       │   │   ├── <Module>FormFields.jsx
│       │   │   └── <Module>FormFooter.jsx
│       │   └── <Module>DeleteDialog.jsx
│       ├── hooks/
│       │   ├── use<Module>Data.js
│       │   └── use<Module>Form.js
│       ├── constants/
│       │   └── <module>.constants.js
│       ├── validation/
│       │   └── <module>.schema.js
│       └── utils.js
├── service/
│   └── <module>.service.js
└── routes/
    └── <Module>Routes.jsx
```

---

## Core Principles (Internet Best Practices)

1. **State Colocation** (Kent C. Dodds) - Keep state as close to where it's used as possible
2. **Server Cache vs UI State** (Kent C. Dodds) - Use React Query for server data, useState for UI
3. **Lifting State Up** (React Official) - Only when multiple components need it
4. **Composition** (React Official) - Children prop, render props, compound components
5. **Custom Hooks** (React Official) - Extract reusable stateful logic
6. **Memoization** (React Official) - Use React.memo, useMemo, useCallback wisely (not prematurely)
7. **Single Responsibility** (React Official) - One component, one job
8. **Accessibility** (Radix UI) - Use accessible primitives, ARIA labels, keyboard nav
9. **Type Safety** (Zod) - Validate at boundaries, parse once
10. **Optimistic Updates** (TanStack Query) - Update UI before server confirms for snappy UX

---

## Real Project Modules (Reference)

| Module | Path | Pattern |
|--------|------|---------|
| **Categories** | `components/Menu/Categories/` | Simple CRUD with table |
| **Menu Items** | `components/Menu/MenuItems/` | CRUD with image upload + form-data |
| **Templates** | `components/Menu/Templates/` | Complex template editor |
| **Tables/QR Codes** | `components/Table-QrCode/` | Grid view with print + custom hooks |
| **Customer Menu** | `components/CustomerMenu/` | Public (no auth) customer view |
| **Feedback** | `components/ClinetSupport/feedback/` | Multi-resource (comments, images) |
| **Auth** | `components/Authentication/` | Login, OTP, password reset |

---

## References (Internet Sources)

- [React Official Docs](https://react.dev/)
- [React Router v7 Docs](https://reactrouter.com/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [TanStack Table Docs](https://tanstack.com/table)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [Shadcn/ui Docs](https://ui.shadcn.com/)
- [Radix UI Docs](https://www.radix-ui.com/)
- [Kent C. Dodds - State Management](https://kentcdodds.com/blog/application-state-management-with-react)
- [Kent C. Dodds - State Colocation](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)
- [date-fns Docs](https://date-fns.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [OWASP Cheat Sheet](https://cheatsheetseries.owasp.org/)
