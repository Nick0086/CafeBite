# 02 - Routing

> Best practices from React Router v7 and React official documentation.

---

## Sources

- [React Router v7 - Declarative Routing](https://reactrouter.com/start/declarative/installation)
- [React Router v7 - Nested Routes](https://reactrouter.com/start/declarative/routing)
- [React Router v7 - Layout Routes](https://reactrouter.com/start/declarative/routing#layout-routes)
- [React - Thinking in React](https://react.dev/learn/thinking-in-react)

---

## Core Concepts

[Source: React Router v7 - Declarative Routing](https://reactrouter.com/start/declarative/installation)

### Route Definition

```jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Nested Routes with `<Outlet />`

[Source: React Router v7 - Nested Routes](https://reactrouter.com/start/declarative/routing)

```jsx
function DashboardLayout() {
  return (
    <div>
      <Sidebar />
      <main>
        <Outlet />  {/* Child route renders here */}
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
```

### Layout Routes (Shared UI)

[Source: React Router v7 - Layout Routes](https://reactrouter.com/start/declarative/routing#layout-routes)

```jsx
<Route path="/" element={<PrivateLayout />}>
  <Route path="menu" element={<MenuPage />} />
  <Route path="qr" element={<QrPage />} />
</Route>
```

### Redirects

```jsx
{/* Redirect on visit */}
<Route path="/old" element={<Navigate to="/new" replace />} />

{/* Default child */}
<Route index element={<Navigate to="dashboard" replace />} />
```

---

## Current Project Routing Structure

**Reference: `frontend/src/App.jsx`**

The project uses three routing trees:

1. **Private routes** (wrapped in Sidebar, requires auth)
2. **Public customer routes** (no auth, e.g., `/menu/:restaurantId/:tableId`)
3. **Restricted routes** (login, register, reset-password, no sidebar)

```jsx
// App.jsx (simplified)
function App() {
  const location = useLocation();
  const path = location.pathname.split('/');
  
  const restrictedRoutes = ['login', 'register-user', 'reset-password'];
  const publicRoutes = ['menu'];  // Customer menu
  
  return (
    <>
      {(!isRestrictedRoute && !isPublicRoute) && (
        <PermissionsProvider>
          <Routes>
            <Route path="/" element={<PrivateRoutes />}>
              <Route path="" element={<Sidebar />}>
                <Route path="menu-management/*" element={<MenuRoutes />} />
                <Route path="qr-management" element={<QrCodeManagerIndex />} />
                <Route path="profile-management" element={<ProfileManagement />} />
                <Route path="ticket-management/*" element={<FeedbackRoutes />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </PermissionsProvider>
      )}

      {isPublicRoute && (
        <Routes>
          <Route path="/menu/:restaurantId/:tableId" element={<CustomerMenuIndex />} />
        </Routes>
      )}

      {isRestrictedRoute && (
        <Routes>
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register-user" element={<Registration />} />
          <Route exact path="/reset-password" element={<ResetPassword />} />
        </Routes>
      )}

      <ToastContainer limit={3} />
      <Toaster position="top-center" expand={true} />
    </>
  );
}
```

---

## Module Route Aggregator

**Reference: `frontend/src/routes/MenuRoutes.jsx`**

```jsx
import { Navigate, Route, Routes } from "react-router";
import { TabsContent } from "@/components/ui/tabs";
import MenuIndex from "@/components/Menu/MenuIndex";
import CategoriesIndex from "@/components/Menu/Categories/CategoriesIndex";

export default function MenuRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MenuIndex />}>
        <Route index element={<Navigate to="tamplate" replace />} />
        <Route path="tamplate" element={<TabsContent value="tamplate"><TemplateIndex /></TabsContent>} />
        <Route path="categories" element={<TabsContent value="categories"><CategoriesIndex /></TabsContent>} />
        <Route path="menu-items" element={<TabsContent value="menu-items"><MenuItemsIndex /></TabsContent>} />
        <Route path="*" element={<Navigate to="/menu-management/tamplate" replace />} />
      </Route>
    </Routes>
  );
}
```

### TabsContent Pattern

The project uses Shadcn's `TabsContent` to coordinate tab state with routing:

```jsx
<TabsContent value="categories">
  <CategoriesIndex />
</TabsContent>
```

This way:
- Route changes when user navigates
- Tab visual state syncs with URL
- Browser back/forward works

---

## Best Practice: Route Protection (Private Routes)

[Source: React Router v7 - Protected Routes](https://reactrouter.com/start/declarative/installation)

**Reference: `frontend/src/common/PrivateRoutes.jsx`**

```jsx
import { Navigate, Outlet, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { checkUserSession } from "@/service/auth.service";
import PilsatingDotesLoader from "@/components/ui/loaders/PilsatingDotesLoader";

export function PrivateRoutes() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check session on mount
  const { error, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: checkUserSession,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (error) {
      window.localStorage.clear();
      setIsAuthenticated(false);
      setIsLoading(false);
    } else if (!sessionLoading) {
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, [error, sessionLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PilsatingDotesLoader />
      </div>
    );
  }

  return isAuthenticated 
    ? <Outlet /> 
    : <Navigate to="/login" replace state={{ from: location }} />;
}
```

**Key rules:**
- Show loader while checking session
- Redirect to login if not authenticated
- Pass current location so user can return after login (`state={{ from: location }}`)
- Use `replace` to avoid back-button loop

---

## Best Practice: Role-Based Routes

```jsx
import { Navigate, Outlet, useContext } from "react-router";
import { PermissionsContext } from "@/contexts/PermissionsContext";

export function AdminOnlyRoute() {
  const { isSuperAdmin } = useContext(PermissionsContext);

  if (!isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

// Usage in App.jsx
<Route element={<AdminOnlyRoute />}>
  <Route path="admin/users" element={<UsersPage />} />
  <Route path="admin/settings" element={<SettingsPage />} />
</Route>
```

---

## Best Practice: 404 Not Found

```jsx
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">404</h1>
      <p>Page not found</p>
      <Button onClick={() => navigate("/")}>Go home</Button>
    </div>
  );
}

// In App.jsx
<Route path="*" element={<NotFound />} />
```

---

## Best Practice: Navigate vs Link

[Source: React Router v7 - Navigation](https://reactrouter.com/start/declarative/navigating)

| Use | Tool | Example |
|-----|------|---------|
| User clicks something | `<Link>` or `<NavLink>` | `<Link to="/about">About</Link>` |
| Programmatic (after action) | `useNavigate()` | `navigate("/dashboard")` |
| Redirect in route | `<Navigate>` | `<Route path="*" element={<Navigate to="/" />} />` |
| Active link styling | `<NavLink>` | `<NavLink to="/about" className={({ isActive }) => isActive ? "active" : ""} />` |

---

## Best Practice: URL Search Params for State

[Source: React Router v7 - URL Search Params](https://reactrouter.com/start/declarative/search-params)

For pagination, filters, and other state that should survive page refresh:

```jsx
import { useSearchParams } from "react-router";

function CategoryList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const search = searchParams.get("search") ?? "";

  const setPage = (newPage) => {
    setSearchParams((prev) => {
      prev.set("page", String(newPage));
      return prev;
    });
  };

  return <Table page={page} onPageChange={setPage} search={search} />;
}
```

---

## Current Project vs Best Practice Comparison

| Aspect | Current State | Best Practice | Action |
|--------|--------------|---------------|--------|
| **Router** | React Router 7 | Same | ✅ Correct |
| **Nested routes** | Used (Menu, Feedback) | Same | ✅ Correct |
| **Private routes** | `PrivateRoutes` component checks session | Same | ✅ Correct |
| **TabsContent** | Used in MenuRoutes | Good pattern | ✅ Correct |
| **Public/Private split** | Logic in App.jsx using path includes | Could be cleaner with layout routes | Acceptable |
| **404 handling** | `<Route path="*" element={<Navigate to="/" replace />} />` | Should render 404 component | New code: use 404 component |
| **Search params** | Not used for state | Should use for filters/pagination | New code: use searchParams |
| **Type safety** | JSX (no TypeScript) | TS gives more safety | Project decision |

---

## Common Anti-Patterns

### ❌ Don't use multiple useState for modal

```jsx
// WRONG
const [isOpen, setIsOpen] = useState(false);
const [mode, setMode] = useState(null);
const [data, setData] = useState(null);
```

### ✅ Use single state object

```jsx
// CORRECT
const [modalState, setModalState] = useState({ open: false, mode: null, data: null });
const openEdit = (row) => setModalState({ open: true, mode: 'edit', data: row });
```

### ❌ Don't hardcode path strings in multiple places

```jsx
// WRONG
navigate("/menu-management/categories"); // Magic string
```

### ✅ Use route constants

```jsx
// CORRECT
export const ROUTES = {
  CATEGORIES: "/menu-management/categories",
  MENU_ITEMS: "/menu-management/menu-items",
};

navigate(ROUTES.CATEGORIES);
```

### ❌ Don't use `<a>` for navigation

```jsx
// WRONG - full page reload
<a href="/about">About</a>
```

### ✅ Use `<Link>` or `useNavigate()`

```jsx
// CORRECT - SPA navigation
<Link to="/about">About</Link>
<button onClick={() => navigate("/about")}>Go to About</button>
```

---

## Checklist for New Module

- [ ] Create `routes/<Module>Routes.jsx` aggregator
- [ ] Use `<Routes>` + `<Route>` from `react-router`
- [ ] Use `<Outlet />` for nested layouts
- [ ] Add `<Navigate>` for default redirects
- [ ] Add `<Route path="*" element={<Navigate to="default" replace />} />` for fallback
- [ ] Register in `App.jsx` with the right parent layout
- [ ] If using tabs, wrap child in `<TabsContent value="...">`
- [ ] For protected routes, wrap in `PrivateRoutes` or custom guard
- [ ] For role-based, use `AdminOnlyRoute` or similar
- [ ] All route paths use kebab-case
- [ ] No magic strings - use ROUTES constants if used multiple times
