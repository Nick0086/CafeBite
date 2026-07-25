# 03 - State Management

> Best practices from React official docs and Kent C. Dodds on state management.

---

## Sources

- [Kent C. Dodds - Application State Management with React](https://kentcdodds.com/blog/application-state-management-with-react)
- [Kent C. Dodds - State Colocation](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)
- [React - Thinking in React](https://react.dev/learn/thinking-in-react)
- [React - useState](https://react.dev/reference/react/useState)
- [React - useReducer](https://react.dev/reference/react/useReducer)
- [React - useContext](https://react.dev/reference/react/useContext)
- [TanStack Query Docs](https://tanstack.com/query/latest)

---

## The Core Principle: State Colocation

[Source: Kent C. Dodds - State Colocation](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)

> "State should live as close to where it's used as possible. Only lift state up when multiple components need it. Only use context when prop drilling becomes painful."

```jsx
// ✅ BEST: State lives in the component that needs it
function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  return <Dialog open={isOpen} onOpenChange={setIsOpen}>...</Dialog>;
}

// ⚠️ OK: Lifted up because two siblings need it
function Parent() {
  const [selectedId, setSelectedId] = useState(null);
  return (
    <>
      <List onSelect={setSelectedId} />
      <Detail id={selectedId} />
    </>
  );
}

// ❌ WORSE: In context when only one component uses it
const ModalContext = createContext();

function App() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ModalContext.Provider value={{ isOpen, setIsOpen }}>
      <Modal />
    </ModalContext.Provider>
  );
}
```

---

## State Categories

[Source: Kent C. Dodds - Application State Management with React](https://kentcdodds.com/blog/application-state-management-with-react)

| Category | Tool | Examples | Notes |
|----------|------|----------|-------|
| **Server Cache** | TanStack Query | Categories, feedback, user profile | Lives on server, cached on client |
| **UI State** | useState / useReducer | Modal open, form values, active tab | Resets on unmount |
| **Global UI State** | Context | Permissions, theme, sidebar | Multiple components read it |
| **URL State** | useSearchParams | Filters, pagination, sort | Survives refresh |
| **Form State** | react-hook-form | Form values, errors | Has its own optimization |
| **Local Storage** | localStorage | Auth tokens, user preferences | Use sparingly |

> **Kent C. Dodds**: "React Query is not a state management library. It's a cache. Server cache has different problems than UI state."

---

## Decision Tree: Where Does State Live?

[Source: Kent C. Dodds - State Colocation](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)

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

---

## Server State: TanStack Query

**Source**: [TanStack Query - Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)

```jsx
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/service/categories.service";

function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,  // 5 minutes
  });
}

function CategoryList() {
  const { data, isLoading, error, refetch } = useCategories();

  if (isLoading) return <TableSkeleton />;
  if (error) return <ErrorState onRetry={refetch} />;
  return <Table data={data} />;
}
```

**Key rules from TanStack Query docs:**
- Query keys are arrays: `["categories", filters]`
- All dependencies of the query function must be in the query key
- `staleTime` controls when data is considered fresh
- `gcTime` controls cache garbage collection
- `retry` is 3 times with exponential backoff by default
- `refetchOnWindowFocus` is true by default

---

## UI State: useState

[Source: React - useState](https://react.dev/reference/react/useState)

```jsx
// Simple state
const [count, setCount] = useState(0);

// Object state - one source of truth
const [modalState, setModalState] = useState({
  open: false,
  mode: null,    // 'create' | 'edit' | 'view'
  data: null,
});

// Multiple useState for unrelated values
const [search, setSearch] = useState("");
const [sort, setSort] = useState("created_at");
```

### Best Practice: One State Object for Related Data

```jsx
// ❌ WRONG: Multiple useState that change together
const [isOpen, setIsOpen] = useState(false);
const [mode, setMode] = useState(null);
const [data, setData] = useState(null);

const openEdit = (row) => {
  setIsOpen(true);
  setMode("edit");
  setData(row);
};

// ✅ CORRECT: One state object
const [modalState, setModalState] = useState({
  open: false,
  mode: null,
  data: null,
});

const openEdit = (row) => {
  setModalState({ open: true, mode: "edit", data: row });
};
```

**Reference: `frontend/src/components/Menu/MenuItems/MenuItemsIndex.jsx:50`**
```jsx
// Current project uses single state object ✅
const [isModalOpen, setIsModalOpen] = useState({ isOpen: false, isEdit: false, data: null, isDirect: false });
```

---

## Complex State: useReducer

[Source: React - useReducer](https://react.dev/reference/react/useReducer)

When state has many sub-values, or when the next state depends on the previous one, use `useReducer`:

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "OPEN_CREATE":
      return { open: true, mode: "create", data: null };
    case "OPEN_EDIT":
      return { open: true, mode: "edit", data: action.payload };
    case "OPEN_VIEW":
      return { open: true, mode: "view", data: action.payload };
    case "CLOSE":
      return { open: false, mode: null, data: null };
    default:
      return state;
  }
}

function CategoryPage() {
  const [modalState, dispatch] = useReducer(reducer, {
    open: false,
    mode: null,
    data: null,
  });

  return (
    <>
      <Button onClick={() => dispatch({ type: "OPEN_CREATE" })}>
        Add Category
      </Button>
      <CategoryForm
        open={modalState.open}
        mode={modalState.mode}
        data={modalState.data}
        onClose={() => dispatch({ type: "CLOSE" })}
      />
    </>
  );
}
```

---

## Global State: Context API

[Source: React - useContext](https://react.dev/reference/react/useContext)

Use Context for state that:
- Is needed by many components
- Doesn't change frequently
- Is truly global (auth, theme, permissions)

### Pattern: Context + Provider + Custom Hook

**Reference: `frontend/src/contexts/PermissionsContext.jsx`**

```jsx
import React, { createContext, useContext, useState } from "react";

const PermissionsContext = createContext(undefined);

export function PermissionsProvider({ children }) {
  const [permissions, setPermissions] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const updatePermissions = (newPerms) => {
    setPermissions(newPerms);
    setIsSuperAdmin(
      newPerms?.unique_id === import.meta.env.VITE_BASE_SUPER_ADMIN_ID
    );
  };

  const value = {
    permissions,
    isSuperAdmin,
    updatePermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

// Custom hook with safety check
export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within PermissionsProvider");
  }
  return context;
}
```

### Best Practices for Context

[Source: React - Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)

1. **Always memoize the value** to prevent unnecessary re-renders:

```jsx
import { useMemo } from "react";

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
```

2. **Split contexts by concern** - don't put everything in one context:

```jsx
// ❌ One mega context
<AppContext.Provider value={{ user, theme, permissions, cart, settings, ... }}>

// ✅ Multiple focused contexts
<ThemeProvider>
  <AuthProvider>
    <PermissionsProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </PermissionsProvider>
  </AuthProvider>
</ThemeProvider>
```

3. **Never use Context for high-frequency updates** (mouse position, scroll) - use a state management library or refs.

---

## URL State: useSearchParams

[Source: React Router - URL Search Params](https://reactrouter.com/start/declarative/search-params)

```jsx
import { useSearchParams } from "react-router";

function CategoryList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "active";

  const updateFilters = (newFilters) => {
    setSearchParams((prev) => {
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === null || value === "") {
          prev.delete(key);
        } else {
          prev.set(key, String(value));
        }
      });
      return prev;
    });
  };

  return (
    <CategoryTable
      page={page}
      search={search}
      status={status}
      onFilterChange={updateFilters}
    />
  );
}
```

**Benefits:**
- Survives page refresh
- Shareable URLs
- Browser back/forward works
- SEO-friendly for public pages

---

## Performance: useMemo and useCallback

[Source: React - useMemo](https://react.dev/reference/react/useMemo), [React - useCallback](https://react.dev/reference/react/useCallback)

> "Don't optimize prematurely. Measure first, then optimize."

### When to use useMemo

```jsx
// ✅ Heavy computation
const sortedData = useMemo(() => {
  return [...data].sort((a, b) => a.value - b.value);
}, [data]);

// ✅ Reference equality for child props
const columns = useMemo(() => [
  { header: "Name", accessorKey: "name" },
  { header: "Status", accessorKey: "status" },
], []);

// ❌ Premature optimization for simple values
const fullName = useMemo(() => `${first} ${last}`, [first, last]); // Not needed
```

### When to use useCallback

```jsx
// ✅ Pass to memoized child
const handleClick = useCallback((id) => {
  setSelectedId(id);
}, []);

// ❌ Premature optimization
const handleClick = useCallback(() => setCount(c => c + 1), []); // Not needed
```

---

## Custom Hooks: Extract Reusable Logic

[Source: React - Building Your Own Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

```jsx
// hooks/useCategories.js
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/service/categories.service";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

// hooks/useCategoryMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory, updateCategory, deleteCategory } from "@/service/categories.service";

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const update = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return { create, update, remove };
}
```

---

## Current Project State Management

| File | State Type | Notes |
|------|-----------|-------|
| `PermissionsContext.jsx` | Global UI state (Context) | User permissions, isSuperAdmin flag |
| `TemplateContext.jsx` | Local UI state (Context) | Template editor state |
| `order-management-context.jsx` | Local UI state (Context) | Order cart for customer menu |
| `PrivateRoutes.jsx` | Local useState (loading) | Auth check state |
| `MenuItemsIndex.jsx` | Local useState (modal) | Single state object for modal |
| `CategoriesIndex.jsx` | Local useState (table + modal) | Sorting, filters, modal state |

---

## Best Practice Checklist

- [ ] Server data → TanStack Query
- [ ] Form data → react-hook-form
- [ ] One component's state → useState in that component
- [ ] Sibling shared state → Lift up to common parent
- [ ] URL-shareable state → useSearchParams
- [ ] App-wide state (auth, theme, perms) → Context
- [ ] Complex state with many sub-values → useReducer
- [ ] High-frequency updates → ref, not state
- [ ] Memoize context values to prevent re-renders
- [ ] Split contexts by concern, not mega context
- [ ] Extract reusable logic to custom hooks
- [ ] Use `useMemo` only for heavy computations or reference equality
- [ ] Use `useCallback` only when passing to memoized children
- [ ] Never put server cache in useState
- [ ] Never put UI state in React Query
