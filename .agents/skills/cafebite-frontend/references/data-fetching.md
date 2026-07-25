# 04 - Data Fetching

> Best practices from TanStack Query, Axios, and modern React data fetching.

---

## Sources

- [TanStack Query - Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [TanStack Query - Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
- [TanStack Query - Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
- [TanStack Query - Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [Kent C. Dodds - React Query as State Manager](https://tkdodo.eu/blog/react-query-as-a-state-manager)
- [TkDodo - Practical React Query](https://tkdodo.eu/blog/practical-react-query)
- [Axios - Interceptors](https://axios-http.com/docs/interceptors)
- [OWASP - JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

## Architecture: Service Layer + React Query

```
┌─────────────────────────────────────────────────────────────────┐
│  Component                                                      │
│  - Calls useQuery / useMutation                                │
│  - Handles loading, error, success states                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Custom Hook (optional)                                        │
│  - Wraps useQuery/useMutation with domain logic                │
│  - Defines query keys centrally                                │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Service Function (src/service/*.service.js)                   │
│  - Pure API call (axios)                                       │
│  - Returns response.data                                       │
│  - Throws on error (via handleApiError)                         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Axios Instance (utils/api.js)                                  │
│  - Base URL, headers                                           │
│  - Request interceptor: attach tokens                          │
│  - Response interceptor: handle 401                            │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend API                                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Axios Instance Setup

**Reference: `frontend/src/utils/api.js`**

```javascript
import axios from "axios";

const isProduction = import.meta.env.PROD === true;
const BASE_URL = isProduction 
  ? import.meta.env.VITE_BASE_URL_PROD 
  : import.meta.env.VITE_BASE_URL_LOCAL;

// Public API (no auth)
export const authApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Authenticated API
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request interceptor - attach tokens
api.interceptors.request.use(
  (config) => {
    const accessToken = window.localStorage.getItem("accessToken");
    const refreshToken = window.localStorage.getItem("refreshToken");
    if (accessToken) {
      config.headers.Authorization = accessToken;
    }
    if (refreshToken) {
      config.headers["user-data"] = refreshToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
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

// Error normalizer
export const handleApiError = (error) => {
  const defaultErrorMessage = "Something went wrong. Please try again.";
  return {
    success: false,
    err: {
      message: error.response?.data?.message || defaultErrorMessage,
      status: error.response?.status || 500,
      error: error.response?.data?.error,
    },
  };
};
```

---

## Service Layer Pattern

[Source: bulletproof-react - API Layer](https://github.com/alan2207/bulletproof-react)

**Reference: `frontend/src/service/categories.service.js`**

```javascript
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

export const updateCategory = async (data) => {
  try {
    const response = await api.put(`/category/${data.categoryId}`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/category/${categoryId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
```

**Rules:**
- One file per backend module
- Pure functions, no React dependencies
- Returns `response.data` (not the full Axios response)
- Throws normalized error via `handleApiError`
- For FormData uploads, set `Content-Type: multipart/form-data`

---

## TanStack Query: useQuery

[Source: TanStack Query - useQuery](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery)

```jsx
import { useQuery } from "@tanstack/react-query";
import { getAllCategory } from "@/service/categories.service";

function CategoryList() {
  const { 
    data,           // Response data
    isLoading,      // True on first load
    isFetching,     // True on any load (including refetch)
    error,          // Error object
    refetch,        // Manual refetch
    isError,        // True if error
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategory,
  });

  if (isLoading) return <TableSkeleton />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  return <Table data={data} />;
}
```

### Query Key Best Practices

[Source: TanStack Query - Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)

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

---

## TanStack Query: Important Defaults

[Source: TanStack Query - Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)

| Default | Value | Override When |
|---------|-------|---------------|
| `staleTime` | 0 (always stale) | Data is static or rarely changes |
| `gcTime` | 5 minutes | Memory is constrained |
| `retry` | 3 with exponential backoff | Non-retryable errors |
| `refetchOnMount` | true | Data is fresh enough |
| `refetchOnWindowFocus` | true | Data is static |
| `refetchOnReconnect` | true | Always |
| `structuralSharing` | true | Performance with large responses |

### Configuration

**Reference: `frontend/src/main.jsx:9-15`**

```jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,  // Disabled in current project
      retry: false,                  // Disabled in current project
    }
  }
});
```

### Per-Query Configuration

```jsx
useQuery({
  queryKey: ["categories"],
  queryFn: getAllCategory,
  
  // Data is fresh for 5 minutes
  staleTime: 5 * 60 * 1000,
  
  // Never refetch automatically
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  
  // Static data: never refetch
  // staleTime: 'static',  // Cannot be invalidated manually
  
  // Manual invalidation only
  // staleTime: Infinity,   // Can be invalidated manually
});
```

---

## TanStack Query: useMutation

[Source: TanStack Query - useMutation](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation)

```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/service/categories.service";
import { toast } from "@/utils/toast-utils";

function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      
      // Or optimistically update
      // queryClient.setQueryData(["categories"], (old) => [...old, data]);
      
      toast.success(data.message || "Category created");
    },
    
    onError: (error) => {
      toast.error(error?.err?.message || "Failed to create category");
    },
  });
}

// Usage in component
function CategoryForm() {
  const createCategory = useCreateCategory();
  
  const handleSubmit = (data) => {
    createCategory.mutate(data, {
      onSuccess: () => {
        // Close modal, reset form, etc.
      },
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Button type="submit" disabled={createCategory.isPending}>
        {createCategory.isPending ? "Creating..." : "Create"}
      </Button>
    </form>
  );
}
```

---

## Query Invalidation Patterns

[Source: TanStack Query - Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)

```javascript
// Invalidate all category queries (list and single)
queryClient.invalidateQueries({ queryKey: ["categories"] });

// Invalidate only list queries
queryClient.invalidateQueries({ queryKey: ["categories", "list"] });

// Exact match only
queryClient.invalidateQueries({ queryKey: ["categories"], exact: true });

// Refetch immediately
queryClient.invalidateQueries({ queryKey: ["categories"], refetchType: "active" });
```

### Best Practice: Invalidate on Mutation

```jsx
const createCategory = useMutation({
  mutationFn: createCategoryAPI,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  },
});

const updateCategory = useMutation({
  mutationFn: updateCategoryAPI,
  onSuccess: (data, variables) => {
    // Invalidate both list and single
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["category", variables.id] });
  },
});
```

---

## Optimistic Updates

[Source: TanStack Query - Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

```jsx
const updateCategory = useMutation({
  mutationFn: updateCategoryAPI,
  onMutate: async (newCategory) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["categories"] });
    
    // Snapshot current state
    const previous = queryClient.getQueryData(["categories"]);
    
    // Optimistically update
    queryClient.setQueryData(["categories"], (old) =>
      old.map((c) => (c.id === newCategory.id ? { ...c, ...newCategory } : c))
    );
    
    // Return rollback function
    return { previous };
  },
  
  onError: (err, newCategory, context) => {
    // Rollback on error
    queryClient.setQueryData(["categories"], context.previous);
  },
  
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  },
});
```

---

## Dependent Queries

[Source: TanStack Query - Dependent Queries](https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries)

```jsx
function MenuItemForm({ categoryId }) {
  // Only fetch if categoryId is set
  const { data: category } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => getCategory(categoryId),
    enabled: !!categoryId,
  });
  
  // ...
}
```

---

## Parallel Queries

```jsx
function DashboardPage() {
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const menuItems = useQuery({ queryKey: ["menu-items"], queryFn: getMenuItems });
  const tables = useQuery({ queryKey: ["tables"], queryFn: getTables });
  
  const isLoading = categories.isLoading || menuItems.isLoading || tables.isLoading;
  const isError = categories.isError || menuItems.isError || tables.isError;
  
  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState />;
  
  return (
    <>
      <CategoryStats data={categories.data} />
      <MenuItemStats data={menuItems.data} />
      <TableStats data={tables.data} />
    </>
  );
}
```

---

## Custom Hooks for Data Fetching

```jsx
// hooks/useCategories.js
import { useQuery } from "@tanstack/react-query";
import { getAllCategory } from "@/service/categories.service";

export const CATEGORIES_QUERY_KEY = "categories";

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: getAllCategory,
    staleTime: 5 * 60 * 1000,
  });
}

// hooks/useCategoryMutations.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "@/service/categories.service";
import { CATEGORIES_QUERY_KEY } from "./useCategories";

export function useCategoryMutations() {
  const queryClient = useQueryClient();
  
  const create = useMutation({
    mutationFn: createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] }),
  });
  
  const update = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] }),
  });
  
  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] }),
  });
  
  return { create, update, remove };
}
```

---

## FormData Uploads

**Reference: `frontend/src/service/menuItems.service.js`**

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

**Usage in component:**
```jsx
const createMenuItem = useMutation({
  mutationFn: createMenuItemAPI,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    toast.success("Menu item created");
  },
});

const handleSubmit = (formData) => {
  const data = new FormData();
  Object.keys(formData).forEach((key) => {
    data.append(key, formData[key]);
  });
  createMenuItem.mutate(data);
};
```

---

## Error Handling Pattern

[Source: React Query - Error Handling](https://tanstack.com/query/latest/docs/framework/react/guides/query-functions#handling-errors)

```jsx
function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategory,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error?.err?.status >= 400 && error?.err?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// In component
function CategoryList() {
  const { data, error, isError, refetch } = useCategories();
  
  useEffect(() => {
    if (isError) {
      toast.error(error?.err?.message || "Failed to load categories");
    }
  }, [isError, error]);
  
  // ...
}
```

---

## Current Project Service Files

| Service | Endpoints | Notes |
|---------|-----------|-------|
| `auth.service.js` | /auth/* | Login, OTP, password reset |
| `categories.service.js` | /category/* | Simple CRUD |
| `menuItems.service.js` | /menu/* | CRUD with file upload |
| `templates.service.js` | /template/* | Template management |
| `table-qrcode.service.js` | /tables/* | QR code CRUD |
| `customer-menu.service.js` | /customer-menu/* | Public menu fetch |
| `clinetFeedback.service.js` | /feedback/* | Feedback + comments + images |
| `subscription.service.js` | /subscription/* | Subscription status |
| `user.service.js` | /client/* | User profile |
| `common.service.js` | /common/* | Countries, states, cities |

---

## Best Practice Checklist

- [ ] Service functions in `src/service/*.service.js`
- [ ] Service returns `response.data`, throws `handleApiError(error)`
- [ ] One `useQuery` per query, one `useMutation` per mutation
- [ ] Query keys as arrays including all dependencies
- [ ] `staleTime` set appropriately per data type
- [ ] Mutations invalidate related queries on success
- [ ] Toast on success (with API message) and error
- [ ] Loading state shown for all async operations
- [ ] Error state with retry option
- [ ] FormData uploads use `Content-Type: multipart/form-data`
- [ ] 401 handling in axios interceptor (redirect to login)
- [ ] Custom hooks for reusable data fetching
- [ ] No fetching in useEffect (use useQuery instead)
- [ ] No server cache in useState (use React Query)
