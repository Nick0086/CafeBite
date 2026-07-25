---
name: cafebite-frontend
description: >
  CafeBite frontend development standards. ALWAYS use this skill for any React frontend
  task in the CafeBite project — creating components, forms, tables, modals, filters,
  hooks, routes, pages, or any UI work. Covers folder structure, component patterns,
  state management (Kent C. Dodds principles), TanStack Query, React Hook Form + Zod,
  TanStack Table, Shadcn/ui conventions, auth flow, and agent execution checklist.
  Trigger on: "create component", "add form", "add table", "add filter", "add modal",
  "add route", "add page", "frontend task", "UI", "fix component", "fix form",
  or any React/frontend work in CafeBite.
---

# CafeBite Frontend Development Skill

Every AI agent working on CafeBite frontend MUST follow this skill before writing code.

## Quick Reference Index

| Topic | Section |
|-------|---------|
| Module folder structure | [→ Folder Structure](#folder-structure) |
| State management | [→ State Management](#state-management) |
| Data fetching (TanStack Query) | [→ Data Fetching](#data-fetching) |
| Forms (React Hook Form + Zod) | [→ Forms](#forms) |
| Tables (TanStack Table) | [→ Tables](#tables) |
| UI components (Shadcn) | [→ UI Conventions](#ui-conventions) |
| Auth flow | [→ Auth](#auth-flow) |
| Component patterns | [→ Components](#component-patterns) |
| Agent checklist | [→ Checklist](#agent-execution-checklist) |

For detailed patterns and examples, see `references/` files:
- `references/folder-structure.md` — complete folder tree, path aliases, naming
- `references/routing.md` — React Router v7, nested routes, protected routes
- `references/state-management.md` — Kent C. Dodds principles, Context, useMemo
- `references/data-fetching.md` — TanStack Query, service layer, axios interceptors
- `references/component-patterns.md` — container/presentational, composition, memo
- `references/forms.md` — React Hook Form, Zod, ReusableFormField
- `references/tables.md` — TanStack Table, columns, filters, pagination
- `references/ui-conventions.md` — buttons, dialogs, toasts, loaders, dates
- `references/auth-flow.md` — tokens, route protection, RBAC, security
- `references/best-practices.md` — compiled reference from all internet sources
- `references/troubleshooting.md` — common errors and fixes

---

## Tech Stack

| Layer | Library | Source |
|-------|---------|--------|
| Build tool | Vite 6 | [vitejs.dev](https://vitejs.dev/) |
| UI Framework | React 18 | [react.dev](https://react.dev/) |
| Routing | React Router 7 | [reactrouter.com](https://reactrouter.com/) |
| Server State | TanStack Query v5 | [tanstack.com/query](https://tanstack.com/query/latest) |
| Tables | TanStack Table v8 | [tanstack.com/table](https://tanstack.com/table) |
| Forms | react-hook-form v7 | [react-hook-form.com](https://react-hook-form.com/) |
| Validation | Zod | [zod.dev](https://zod.dev/) |
| UI Components | Shadcn/ui (Radix + Tailwind) | [ui.shadcn.com](https://ui.shadcn.com/) |
| Styling | Tailwind CSS 3 | [tailwindcss.com](https://tailwindcss.com/) |
| Icons | Lucide React | [lucide.dev](https://lucide.dev/) |
| HTTP | Axios | [axios-http.com](https://axios-http.com/) |
| Dates | date-fns | [date-fns.org](https://date-fns.org/) |
| Toast | react-toastify | via `toast-utils.js` wrapper |

---

## Folder Structure

### Module Folder Convention

Every feature module follows this structure:

```
src/components/<ModuleName>/
├── <ModuleName>Index.jsx              # Page entry: orchestrates everything
│
├── components/                        # Module-specific components
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
│   └── <Module>InfoPanel.jsx          # Single file (or folder if tabs)
│
├── hooks/                             # Module-specific hooks
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
└── utils.js                           # Module-specific helpers
```

### Service Layer

One file per backend module in `src/service/`:

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

### Component → Sub-Folder Decision Rule

```
Component > ~150 lines?              → folder with index.jsx
Defines internal sub-components?     → folder with index.jsx
Has 2+ distinct UI sections?         → folder with index.jsx
Otherwise                            → single file is fine
```

**Always a folder regardless of size:**
- `<Module>Table/` — always needs Columns + RowActions
- `<Module>Form/` — always needs FormFields + FormFooter
- `<Module>FilterModal/` — always needs modal shell + form

### File Naming Rules

| What | Convention | Example |
|------|-----------|---------|
| Page entry | `<Module>Index.jsx` | `CategoriesIndex.jsx` |
| Component folder | PascalCase | `<Module>Table/` |
| Component entry | `index.jsx` inside folder | `<Module>Table/index.jsx` |
| Sub-components | PascalCase + suffix | `<Module>Columns.jsx` |
| Hooks | camelCase with `use` prefix | `useCategories.js` |
| Constants | camelCase + `.constants.js` | `category.constants.js` |
| Validation | camelCase + `.schema.js` | `category.schema.js` |
| Service | camelCase + `.service.js` | `categories.service.js` |

### Path Aliases

Always use `@/` alias for absolute imports:

```javascript
// CORRECT
import { Button } from "@/components/ui/button"
import { getCategories } from "@/service/categories.service"
import { cn } from "@/lib/utils"

// WRONG - deep relative paths
import { Button } from "../../../components/ui/button"
```

### Import Order

```javascript
// 1. External packages
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal absolute (@/ alias)
import { Button } from '@/components/ui/button'
import { getCategories } from '@/service/categories.service'

// 3. Relative imports
import { CategoryForm } from './components/CategoryForm'
```

---

## State Management

### Core Principle: State Colocation

[Source: Kent C. Dodds](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)

> "State should live as close to where it's used as possible."

### State Categories

| Category | Tool | Examples |
|----------|------|----------|
| **Server Cache** | TanStack Query | Categories, feedback, user profile |
| **UI State** | useState / useReducer | Modal open, form values, active tab |
| **Global UI State** | Context | Permissions, theme, sidebar |
| **URL State** | useSearchParams | Filters, pagination, sort |
| **Form State** | react-hook-form | Form values, errors |

### Decision Tree: Where Does State Live?

```
Is it server data (fetched from API)?
├── Yes → TanStack Query
└── No
    ├── Is it form data?
    │   └── Yes → react-hook-form
    ├── Does it need to survive refresh / be shareable via URL?
    │   └── Yes → useSearchParams (URL state)
    ├── Is it used by ONE component?
    │   └── Yes → useState in that component
    ├── Is it shared by SIBLING components (2-3 levels)?
    │   └── Yes → Lift state up to common parent
    ├── Is it used across the app (auth, theme, perms)?
    │   └── Yes → Context
    └── Otherwise → useState in closest common parent
```

### Golden Rules

- **Never put server cache in useState** — use TanStack Query
- **Never put UI state in React Query** — use useState/useReducer
- **Single state object for related data** (modal: `{ open, mode, data }`)

### Modal State Pattern

```jsx
// CORRECT: Single state object
const [modalState, setModalState] = useState({
  open: false,
  mode: null,  // 'create' | 'edit' | 'view'
  data: null,
});

const openEdit = (row) => setModalState({ open: true, mode: 'edit', data: row });
const openCreate = () => setModalState({ open: true, mode: 'create', data: null });
const closeModal = () => setModalState({ open: false, mode: null, data: null });
```

### Context Pattern

```jsx
import { createContext, useContext, useMemo } from "react";

const PermissionsContext = createContext(undefined);

export function PermissionsProvider({ children }) {
  const [permissions, setPermissions] = useState(null);

  const value = useMemo(
    () => ({ permissions, updatePermissions: setPermissions }),
    [permissions]
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within PermissionsProvider");
  }
  return context;
}
```

---

## Data Fetching

### Service Layer Pattern

```javascript
// src/service/categories.service.js
import { api, handleApiError } from "@/utils/api";

export const getAllCategory = async () => {
  try {
    const response = await api.get("/category");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createCategory = async (data) => {
  try {
    const response = await api.post("/category", data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
```

**Rules:**
- One file per backend module
- Pure functions, no React dependencies
- Returns `response.data` (not full Axios response)
- Throws normalized error via `handleApiError`

### TanStack Query: useQuery

```jsx
import { useQuery } from "@tanstack/react-query";
import { getAllCategory } from "@/service/categories.service";

function CategoryList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategory,
    staleTime: 5 * 60 * 1000,  // 5 minutes
  });

  if (isLoading) return <TableSkeleton />;
  if (error) return <ErrorState onRetry={refetch} />;
  return <Table data={data} />;
}
```

### Query Key Best Practices

```javascript
// Static key
queryKey: ["categories"]

// With filter
queryKey: ["categories", { status: "active" }]

// With pagination
queryKey: ["categories", { page: 1, limit: 10 }]

// Hierarchical (for invalidation)
queryKey: ["categories", "list", filters]
queryKey: ["category", id]  // single category
```

**Rule**: Query key must include all variables that affect the query result.

### TanStack Query: useMutation

```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/service/categories.service";

function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toastSuccess(data.message || "Category created");
    },
    onError: (error) => {
      toastError(error?.err?.message || "Failed to create category");
    },
  });
}
```

### FormData Uploads

```javascript
export const createMenuItem = async (data) => {
  try {
    const response = await api.post("/menu", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
```

---

## Forms

### Why React Hook Form?

- No re-renders on every keystroke (uncontrolled inputs)
- Isolated re-renders — only field with error re-renders
- Built-in validation
- Small bundle size (~9KB)

### Two Approaches

| Approach | Use For |
|----------|---------|
| `register` (uncontrolled) | Native inputs (Input, Textarea) |
| `Controller` (controlled) | Shadcn Select, Combobox, Switch, DatePicker |

### Schema Validation with Zod

```javascript
// validation/category.schema.js
import { z } from "zod";

export const categorySchema = z.object({
  name: z.string()
    .min(1, "Category name is required")
    .max(255, "Max 255 characters")
    .trim(),
  status: z.number().int().min(0).max(1).optional(),
});
```

### Complete Form Pattern

```jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { createCategory, updateCategory } from "@/service/categories.service";
import { toastSuccess, toastError } from "@/utils/toast-utils";
import { categorySchema } from "./validation/category.schema";

const defaultValues = { name: "", status: 1 };

export function CategoryForm({ open, onHide, isEdit, selectedRow }) {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  // Reset form when modal opens/closes or data changes
  useEffect(() => {
    if (isEdit && selectedRow) {
      form.reset({ name: selectedRow.name, status: selectedRow.status });
    } else {
      form.reset(defaultValues);
    }
  }, [isEdit, selectedRow, form, open]);

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toastSuccess(res?.message || "Category created");
      handleClose();
    },
    onError: (error) => toastError(error?.err?.message || "Failed"),
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toastSuccess(res?.message || "Category updated");
      handleClose();
    },
    onError: (error) => toastError(error?.err?.message || "Failed"),
  });

  const onSubmit = (data) => {
    if (isEdit) {
      updateMutation.mutate({ categoryId: selectedRow.unique_id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClose = () => {
    form.reset(defaultValues);
    onHide();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Create Category"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter category name" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-4">
              <Button type="submit" variant="gradient" disabled={isPending}>
                {isPending ? "Saving..." : "Submit"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### ReusableFormField

The project has `src/common/Form/ReusableFormField.jsx` that wraps Shadcn FormField. Supports: `text`, `select`, `combobox`, `textarea`, `checkbox`, `switch`, `password`, `OTP`, `radio`, `file`, `email`, `tagInput`, `PhoneInput`.

```jsx
<ReusableFormField
  control={form.control}
  name="name"
  type="text"
  label="Category Name"
  required={true}
  placeholder="Enter name"
/>
```

---

## Tables

### Why TanStack Table?

- Headless UI — no styles, you bring your own
- TypeScript-first
- Lightweight (~15KB)
- Extensible — custom cell renderers, filter functions

### Core Pattern

```jsx
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table";

const table = useReactTable({
  data,
  columns,
  state: { sorting, columnFilters },
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});
```

### Column Definitions (ALWAYS useMemo)

```jsx
const columns = useMemo(() => [
  {
    accessorKey: "name",
    header: "Category Name",
    cell: ({ cell }) => <span>{cell.getValue()}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ cell }) =>
      cell.getValue() === 1 ? (
        <Chip color="green" variant="light" border="none">Active</Chip>
      ) : (
        <Chip color="red" variant="light" border="none">Inactive</Chip>
      ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button onClick={() => handleEdit(row.original)}>Edit</Button>
        <Button onClick={() => handleDelete(row.original)}>Delete</Button>
      </div>
    ),
    enableSorting: false,
  },
], [handleEdit, handleDelete]);
```

### Row Models

| Row Model | Purpose |
|-----------|---------|
| `getCoreRowModel()` | Required — basic row access |
| `getSortedRowModel()` | Sort by column |
| `getFilteredRowModel()` | Filter by column value |
| `getPaginationRowModel()` | Paginate visible rows |
| `getFacetedRowModel()` | Unique values for filters |

**Rule**: Only include the row models you actually use.

### Server-Side Pagination

```jsx
const table = useReactTable({
  data: serverData,
  rowCount: parseInt(serverData?.pagination?.total) || 0,
  columns,
  state: { pagination },
  onPaginationChange: setPagination,
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true,  // Server handles pagination
});
```

### CommonTable Component

The project has `src/common/Table/CommonTable.jsx` that renders a TanStack Table instance with consistent styling:

```jsx
<CommonTable
  table={tableInstance}
  tableStyle="h-[60dvh]"
  tableHeadRowStyle="bg-indigo-50/20"
  tableBodyRowStyle="bg-transparent hover:bg-indigo-50/50"
  selectRow={selectedId}
/>
```

---

## UI Conventions

### Icons: Lucide React

```jsx
import { Plus, Trash2, Pencil, Info, Search } from "lucide-react";

<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>
```

**Rules:**
- Only Lucide icons (no FontAwesome, Material Icons)
- Import individually for tree-shaking
- Always set size via Tailwind classes (`h-4 w-4`)

### Buttons

| Variant | Use | Style |
|---------|-----|-------|
| `default` | Primary action | Solid bg |
| `gradient` | Submit form | Gradient bg |
| `outline` | Secondary/cancel | Border only |
| `ghost` | Tertiary/icon | No bg |
| `destructive` | Delete/danger | Red bg |

### Status Display (Borderless Chip)

```jsx
<Chip className='gap-1' variant='light' color='green' radius='md' size='sm' border='none'>
  Active
</Chip>
```

### Dialogs

```jsx
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Category</DialogTitle>
    </DialogHeader>
    {/* form content */}
    <DialogFooter>
      <Button type="submit" variant="gradient">Save</Button>
      <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Toasts

```javascript
import { toastSuccess, toastError } from "@/utils/toast-utils";

toastSuccess(res?.message || "Category created");
toastError(error?.err?.message || "Failed to create category");
```

**Rules:**
- Use centralized toast utility
- Success on add/edit
- Error with exact API message
- Limit: 3 toasts max

### Dates (date-fns)

```javascript
import { format } from "date-fns";

export const formatDate = (date) =>
  date ? format(new Date(date), 'EEE, dd-MM-yyyy') : '—';

export const formatDateTime = (date) =>
  date ? format(new Date(date), 'dd-MM-yyyy hh:mm:ss a')
        .replace('am', 'AM').replace('pm', 'PM') : '—';
```

**Rules:**
- Use `date-fns`, NEVER `moment.js`
- Put formats in `utils/date.utils.js`
- Use `—` for null/undefined values

### Loaders

- **Never use Slack loader**
- Analytics cards: bouncing dots
- Content loading: Shadcn `Skeleton`
- Button actions: spinner (`Loader2` from Lucide)

---

## Auth Flow

### Token Storage

Current project uses `localStorage`:

```javascript
localStorage.setItem("accessToken", token);
localStorage.setItem("refreshToken", refreshToken);
```

### Axios Interceptors

```javascript
// Request interceptor — attach tokens
api.interceptors.request.use((config) => {
  const accessToken = window.localStorage.getItem("accessToken");
  const refreshToken = window.localStorage.getItem("refreshToken");
  if (accessToken) config.headers.Authorization = accessToken;
  if (refreshToken) config.headers["user-data"] = refreshToken;
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### Protected Routes

```jsx
import { Navigate, Outlet, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { checkUserSession } from "@/service/auth.service";

export function PrivateRoutes() {
  const location = useLocation();
  const { data, error, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: checkUserSession,
    retry: false,
    staleTime: Infinity,
  });

  if (isLoading) return <Loader />;
  if (error || !data) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
```

### Role-Based Access

```jsx
import { usePermissions } from "@/contexts/PermissionsContext";

function AdminButton() {
  const { isSuperAdmin } = usePermissions();
  if (!isSuperAdmin) return null;
  return <Button>Delete User</Button>;
}
```

---

## Component Patterns

### Container vs Presentational

```jsx
// CONTAINER: Handles data, state, side effects
function CategoryList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const [modalState, setModalState] = useState({ open: false, mode: null, data: null });

  if (isLoading) return <CategoryListSkeleton />;
  if (error) return <ErrorState error={error} />;

  return (
    <CategoryListView
      categories={data}
      onEdit={(cat) => setModalState({ open: true, mode: "edit", data: cat })}
      onDelete={(id) => deleteCategory(id)}
    />
  );
}

// PRESENTATIONAL: Pure UI, only props
function CategoryListView({ categories, onEdit, onDelete }) {
  return (
    <div>
      {categories.map((cat) => (
        <CategoryRow key={cat.id} category={cat} onEdit={() => onEdit(cat)} onDelete={() => onDelete(cat.id)} />
      ))}
    </div>
  );
}
```

### Composition Patterns

```jsx
// Children prop
function Card({ children, title }) {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

// Compound components (Tabs)
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview"><OverviewPanel /></TabsContent>
  <TabsContent value="settings"><SettingsPanel /></TabsContent>
</Tabs>
```

### Memoization

```jsx
// React.memo — when component re-renders often with same props
const ExpensiveRow = React.memo(function ExpensiveRow({ data, onEdit }) {
  return <tr>...</tr>;
});

// useMemo — heavy computation or reference equality
const sortedData = useMemo(() => {
  return [...data].sort((a, b) => a.value - b.value);
}, [data]);

// useCallback — pass to memoized child
const handleClick = useCallback((id) => {
  setSelectedId(id);
}, []);
```

**Rule**: Don't optimize prematurely. Measure first.

---

## Agent Execution Checklist

Before marking any frontend task as done, verify every item:

### Structure
- [ ] Module folder created at `components/<ModuleName>/`
- [ ] `<ModuleName>Index.jsx` at root (page entry)
- [ ] `components/<Module>Table/` folder with `index.jsx` + `Columns.jsx` + `RowActions.jsx`
- [ ] `components/<Module>Form/` folder with `index.jsx` + `FormFields.jsx` + `FormFooter.jsx`
- [ ] `components/<Module>DeleteDialog.jsx` single file
- [ ] `hooks/use<Module>Data.js` — React Query hooks
- [ ] `hooks/use<Module>Form.js` — RHF setup
- [ ] `constants/<module>.constants.js` — enums, options
- [ ] `validation/<module>.schema.js` — Zod schemas
- [ ] `service/<module>.service.js` — API calls

### Libraries
- [ ] Only Lucide icons used
- [ ] date-fns used for all dates (no Moment)
- [ ] react-hook-form used for all forms
- [ ] Zod schema used for all validation
- [ ] tanstack/react-query for all API calls
- [ ] Shadcn components used throughout

### State Management
- [ ] Server data → TanStack Query
- [ ] Form data → react-hook-form
- [ ] UI state → useState/useReducer
- [ ] Modal state → single object `{ open, mode, data }`
- [ ] Context values memoized with `useMemo`

### UI
- [ ] Add button: top-right with icon
- [ ] Submit: gradient variant
- [ ] Cancel: outline variant
- [ ] Status as borderless chip
- [ ] Table action order: Edit → Delete → Info
- [ ] Table content center-aligned
- [ ] Loading state shows loader
- [ ] Empty state shows message
- [ ] Error state shows toast

### Forms
- [ ] Single form for create and edit
- [ ] `form.reset()` when modal opens/closes
- [ ] Disable submit button during mutation
- [ ] Toast success/error
- [ ] Accessible labels on all fields
- [ ] Required fields marked with `*`

### Tables
- [ ] Always `useMemo` the columns array
- [ ] Cell renderers for complex content
- [ ] Custom filter functions when needed
- [ ] Loading state (skeleton or spinner)
- [ ] Empty state
- [ ] Stable, unique keys for all rows

### Auth
- [ ] Tokens attached via axios interceptor
- [ ] 401 response clears tokens and redirects
- [ ] Protected routes use `PrivateRoutes` wrapper
- [ ] Role-based access via `usePermissions`

### Other
- [ ] All imports use `@/` alias
- [ ] Import order: external → internal → relative
- [ ] No inline styles (use Tailwind)
- [ ] Responsive on mobile/tablet/desktop
- [ ] No `dangerouslySetInnerHTML` with user input

---

## Common Anti-Patterns

### WRONG: Fetch in useEffect

```jsx
// WRONG
function CategoryList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/category")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);
}

// CORRECT
function CategoryList() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}
```

### WRONG: Multiple useState for Modal

```jsx
// WRONG
const [isOpen, setIsOpen] = useState(false);
const [mode, setMode] = useState(null);
const [data, setData] = useState(null);

// CORRECT
const [modalState, setModalState] = useState({
  open: false,
  mode: null,
  data: null,
});
```

### WRONG: Index as Key

```jsx
// WRONG
{items.map((item, index) => <Item key={index} {...item} />)}

// CORRECT
{items.map((item) => <Item key={item.id} {...item} />)}
```

### WRONG: Server Cache in useState

```jsx
// WRONG
const [categories, setCategories] = useState([]);
useEffect(() => {
  getCategories().then(setCategories);
}, []);

// CORRECT
const { data: categories } = useQuery({
  queryKey: ["categories"],
  queryFn: getCategories,
});
```

---

## References

- `references/folder-structure.md` — complete folder tree, path aliases, naming
- `references/routing.md` — React Router v7, nested routes, protected routes
- `references/state-management.md` — Kent C. Dodds principles, Context, useMemo
- `references/data-fetching.md` — TanStack Query, service layer, axios interceptors
- `references/component-patterns.md` — container/presentational, composition, memo
- `references/forms.md` — React Hook Form, Zod, ReusableFormField
- `references/tables.md` — TanStack Table, columns, filters, pagination
- `references/ui-conventions.md` — buttons, dialogs, toasts, loaders, dates
- `references/auth-flow.md` — tokens, route protection, RBAC, security
- `references/best-practices.md` — compiled reference from all internet sources
- `references/troubleshooting.md` — common errors and fixes
