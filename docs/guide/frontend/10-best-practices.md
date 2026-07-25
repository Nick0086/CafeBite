# 10 - Best Practices (Compiled Reference)

> All best practices from internet sources, compiled for quick reference.

---

## Sources

| Source | URL | Topic |
|--------|-----|-------|
| React Official | [react.dev](https://react.dev/) | Components, hooks, state |
| React Router v7 | [reactrouter.com](https://reactrouter.com/) | Routing |
| TanStack Query | [tanstack.com/query](https://tanstack.com/query/latest) | Server state |
| TanStack Table | [tanstack.com/table](https://tanstack.com/table) | Tables |
| React Hook Form | [react-hook-form.com](https://react-hook-form.com/) | Forms |
| Zod | [zod.dev](https://zod.dev/) | Validation |
| Shadcn/ui | [ui.shadcn.com](https://ui.shadcn.com/) | UI components |
| Radix UI | [radix-ui.com](https://www.radix-ui.com/) | Primitives |
| Kent C. Dodds | [kentcdodds.com](https://kentcdodds.com/) | State mgmt |
| TkDodo | [tkdodo.eu](https://tkdodo.eu/) | React Query |
| Tailwind CSS | [tailwindcss.com](https://tailwindcss.com/) | Styling |
| date-fns | [date-fns.org](https://date-fns.org/) | Dates |
| Vite | [vitejs.dev](https://vitejs.dev/) | Build tool |
| Axios | [axios-http.com](https://axios-http.com/) | HTTP client |
| OWASP | [owasp.org](https://cheatsheetseries.owasp.org/) | Security |

---

## 1. Component Design

[Source: react.dev/learn/thinking-in-react](https://react.dev/learn/thinking-in-react)

| Rule | Why |
|------|-----|
| Single responsibility per component | Easier to test, reuse, understand |
| Build static first, add state last | Separates concerns |
| Minimal state representation | Don't store derived values |
| State colocation | Keep state close to where it's used |
| Lift state up only when needed | Avoid premature abstraction |
| Composition over inheritance | React's strength |
| Container vs presentational | Easier testing |

**Decision tree for state location:**
```
Server data → TanStack Query
Form data → react-hook-form
One component → useState
2-3 siblings → lift up
URL-shareable → useSearchParams
App-wide → Context
High-frequency updates → useRef
```

---

## 2. State Management

[Source: kentcdodds.com/blog/application-state-management-with-react](https://kentcdodds.com/blog/application-state-management-with-react)

| Type | Tool | Example |
|------|------|---------|
| Server cache | TanStack Query | Categories, user profile |
| UI state | useState / useReducer | Modal open, form values |
| Global UI | Context | Auth, theme, permissions |
| URL state | useSearchParams | Filters, pagination |
| Form state | react-hook-form | Login form, signup form |

**Kent C. Dodds principle**: "React Query is a cache, not state management. Server cache has different problems than UI state."

**State colocation**: Keep state as close to where it's used as possible. Only lift up when multiple components need it.

---

## 3. TanStack Query

[Source: tanstack.com/query/latest/docs/framework/react/guides/important-defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)

| Default | Value | Override When |
|---------|-------|---------------|
| `staleTime` | 0 (always stale) | Static or rarely changing data |
| `gcTime` | 5 minutes | Memory constraints |
| `retry` | 3 with exponential backoff | Non-retryable errors |
| `refetchOnWindowFocus` | true | Static data |
| `refetchOnMount` | true | Data is fresh enough |
| `refetchOnReconnect` | true | Always |
| `structuralSharing` | true | Performance with large responses |

**Query keys**: arrays, include all dependencies.

**Mutations**: `onSuccess` → `invalidateQueries`.

**Optimistic updates**: `onMutate` → update cache → `onError` → rollback.

---

## 4. React Hook Form

[Source: react-hook-form.com/get-started](https://react-hook-form.com/get-started)

| Use Case | API |
|----------|-----|
| Native input | `register` (uncontrolled) |
| Shadcn Select | `Controller` |
| React-Select | `Controller` |
| Date picker | `Controller` |
| Custom input | `Controller` |

**Performance**: Only the field with error re-renders, not the whole form.

**Validation**: Use Zod schema with `zodResolver` for type-safe validation.

**Reset**: `form.reset(defaultValues)` when modal opens or data changes.

---

## 5. TanStack Table

[Source: tanstack.com/table/v8/docs/introduction](https://tanstack.com/table/v8/docs/introduction)

| Rule | Why |
|------|-----|
| Always `useMemo` columns | Prevent re-renders |
| Only include row models you use | Bundle size, performance |
| `manualPagination: true` for server-side | Don't double-paginate |
| Custom filter functions for complex logic | Default filters are limited |
| Cell renderers for complex content | Keep columns clean |

**Row models**: `getCoreRowModel` (required), `getSortedRowModel`, `getFilteredRowModel`, `getPaginationRowModel`, `getFacetedRowModel`, `getFacetedUniqueValues`.

---

## 6. Routing

[Source: reactrouter.com/start/declarative/installation](https://reactrouter.com/start/declarative/installation)

| Pattern | Use |
|---------|-----|
| `<Route>` with `element` | Route definition |
| Nested routes | Parent layout + child pages |
| `<Outlet />` | Where child renders |
| `<Navigate replace>` | Redirect |
| `<Link>` | SPA navigation (clickable) |
| `useNavigate()` | Programmatic navigation |
| `<NavLink>` | Link with active state |
| `useSearchParams` | URL state |
| `useParams` | URL params |
| `useLocation` | Current location |

**Protected routes**: Wrapper component checks auth, redirects to login.

**Role-based routes**: `AdminOnlyRoute` checks role.

---

## 7. Forms

[Source: react-hook-form.com/docs](https://react-hook-form.com/docs)

```jsx
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues,
  mode: "onSubmit",  // or "onBlur", "onChange", "onTouched"
});
```

**Modal state pattern**: Single object `{ open, mode, data }`.

**Single form for create and edit**: Reset on open, populate from props when editing.

**File upload**: Use `FormData` with `Content-Type: multipart/form-data`.

**Loading state**: `isPending` from `useMutation`, disable submit button.

---

## 8. UI Components (Shadcn)

[Source: ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components)

| Component | Use |
|-----------|-----|
| `Button` | All buttons (variants: default, gradient, outline, ghost, destructive) |
| `Dialog` | Short interactions (modals) |
| `Sheet` | Long content (drawers) |
| `AlertDialog` | Confirmation dialogs |
| `Input` | Text input (always use with `label`) |
| `Textarea` | Multi-line input |
| `Select` | Dropdown (never native `<select>`) |
| `Combobox` | Searchable dropdown |
| `Checkbox` | Boolean toggle |
| `Switch` | Boolean toggle (settings) |
| `RadioGroup` | Mutually exclusive options |
| `Tabs` | Tabbed interface |
| `Card` | Content container |
| `Toast` | Notifications (via wrapper) |
| `Tooltip` | Hover hints |
| `DropdownMenu` | Context menus |
| `Form` | RHF integration (Shadcn) |
| `Skeleton` | Loading state |
| `Badge` | Small labels |
| `Avatar` | User images |
| `Calendar` / `DatePicker` | Date selection |

---

## 9. Styling (Tailwind)

[Source: tailwindcss.com/docs/utility-first](https://tailwindcss.com/docs/utility-first)

| Pattern | Example |
|---------|---------|
| Utility classes only | `className="flex items-center gap-2 p-4"` |
| Mobile-first | `className="w-full md:w-1/2"` |
| Responsive breakpoints | `sm:`, `md:`, `lg:`, `xl:`, `2xl:` |
| Conditional classes | `cn('base', isActive && 'active')` |
| Theme colors (no raw colors) | `text-primary`, `bg-muted` |
| No inline styles | Avoid `style={{}}` |
| Component variants | Use CVA or `cva` |

**Class name utility** (cn):
```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

---

## 10. Performance

[Source: react.dev/learn/render-and-commit](https://react.dev/learn/render-and-commit)

| Technique | When |
|-----------|------|
| `React.memo` | Component re-renders often with same props |
| `useMemo` | Heavy computation, reference equality needed |
| `useCallback` | Pass to memoized child |
| Code splitting (`lazy`) | Large components not always needed |
| Virtualization | Lists with 100+ items |
| Debounce/throttle | Frequent events (search input) |
| `staleTime` | Reduce refetches |
| `structuralSharing` | Enabled by default in TanStack Query |

**Rule**: Don't optimize prematurely. Measure first (Profiler, React DevTools).

---

## 11. Accessibility

[Source: radix-ui.com/primitives/docs/overview/accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)

| Rule | Why |
|------|-----|
| Semantic HTML | `<button>`, `<nav>`, `<main>`, etc. |
| Labels on all inputs | Screen readers |
| ARIA when needed | `aria-label`, `aria-describedby` |
| Keyboard navigation | Tab, Enter, Escape, Arrow keys |
| Focus management | Visible focus ring, trap in modals |
| Color contrast | WCAG AA (4.5:1 for text) |
| Alt text on images | Describe content |
| Skip links | Skip to main content |
| Live regions | Dynamic content updates |

---

## 12. Security (OWASP)

[Source: cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/)

| Rule | Why |
|------|-----|
| HTTPS in production | Encrypted transport |
| HTTP-only cookies (preferred) | XSS-safe token storage |
| Short-lived access tokens | Minimize damage from theft |
| Refresh token rotation | Detect token theft |
| No `dangerouslySetInnerHTML` with user input | XSS prevention |
| Input validation on client AND server | Defense in depth |
| Rate limiting on auth endpoints | Prevent brute force |
| CSP headers | XSS mitigation |
| CORS configured properly | Prevent unauthorized access |
| No secrets in code or env files committed | Credential leak |

---

## 13. Code Quality

| Rule | Why |
|------|-----|
| No magic strings | Use constants |
| No magic numbers | Use named constants |
| Self-documenting code | Variable names explain intent |
| Comments only when needed | Code should be the source of truth |
| JSDoc for public APIs | Better autocomplete |
| Consistent naming | camelCase vars, PascalCase components |
| Single export per file (usually) | Easier imports |
| Default export for pages | Named export for utilities |
| Import order: external → internal → relative | Consistent style |
| `displayName` for debugging | Better React DevTools |

---

## 14. File Organization

[Source: bulletproof-react](https://github.com/alan2207/bulletproof-react)

```
src/
├── components/
│   ├── <Module>/
│   │   ├── <Module>Index.jsx          # Page entry
│   │   ├── components/                # Sub-components
│   │   ├── hooks/                     # Data + form hooks
│   │   ├── constants/                 # Enums, options
│   │   ├── validation/                # Zod schemas
│   │   └── utils.js
│   └── ui/                            # Shadcn primitives
├── service/                           # API layer
├── hooks/                             # Shared hooks
├── contexts/                          # React Context
├── utils/                             # Pure utilities
├── lib/                               # Internal libs
├── common/                            # Cross-cutting components
└── routes/                            # Route aggregators
```

**Rules:**
- One service file per backend module
- One folder per feature module
- Module-specific things inside module folder
- Shared things in `common/`, `hooks/`, `utils/`

---

## 15. Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `CategoryList` |
| Hooks | camelCase, `use` prefix | `useCategories` |
| Variables | camelCase | `isLoading` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| Functions | camelCase, verb prefix | `fetchCategories` |
| Booleans | `is/has/can/should` prefix | `isActive`, `hasError` |
| Event handlers | `handle/on` prefix | `handleClick`, `onSubmit` |
| Files (components) | PascalCase | `CategoryList.jsx` |
| Files (utils) | camelCase | `formatDate.js` |
| CSS classes | Tailwind utilities | `flex items-center` |
| API endpoints | kebab-case | `/menu-items` |
| Database columns | snake_case | `created_at` |
| Routes | kebab-case | `/menu-management` |

---

## 16. Error Handling

[Source: tkdodo.eu/blog/breaking-react-querys-api-on-purpose](https://tkdodo.eu/blog/breaking-react-querys-api-on-purpose)

```javascript
// Service layer
export const handleApiError = (error) => ({
  success: false,
  err: {
    message: error.response?.data?.message || "Something went wrong",
    status: error.response?.status || 500,
  },
});

// In query
useQuery({
  queryKey: [...],
  queryFn: apiCall,
  retry: (failureCount, error) => {
    if (error?.err?.status >= 400 && error?.err?.status < 500) return false;
    return failureCount < 3;
  },
});

// In component
useEffect(() => {
  if (error) toastError(error?.err?.message);
}, [error]);
```

**Rules:**
- Normalize errors in service layer
- Show exact API error message
- Disable retry on 4xx (client errors)
- Enable retry on 5xx (server errors) with backoff

---

## 17. Testing

[Source: react.dev/learn/testing](https://react.dev/learn/testing)

| Type | Tool | What |
|------|------|------|
| Unit | Vitest / Jest | Pure functions, hooks |
| Component | React Testing Library | Component behavior |
| Integration | MSW + RTL | Multiple components + API |
| E2E | Playwright / Cypress | Full user flows |

**Principles:**
- Test behavior, not implementation
- Use `screen.getByRole` over `getByTestId`
- Don't test internal state
- Use `userEvent` over `fireEvent`
- Mock service layer, not fetch

---

## 18. Bundle Size

[Source: vitejs.dev/guide/build](https://vitejs.dev/guide/build.html)

| Strategy | When |
|----------|------|
| Code splitting | Routes, large components |
| Tree shaking | Always (Vite does this) |
| Dynamic imports | Heavy libraries (charts, etc.) |
| Icon imports | Individual, not all from library |
| Avoid barrel imports | Can break tree shaking |
| Compression | Brotli/Gzip in production |

```jsx
// Code splitting
const Dashboard = lazy(() => import('./Dashboard'));

<Suspense fallback={<Loader />}>
  <Dashboard />
</Suspense>
```

---

## 19. Environment Variables

```env
# .env.development
VITE_BASE_URL_LOCAL=http://localhost:3002
VITE_BASE_SUPER_ADMIN_ID=admin-uuid

# .env.production
VITE_BASE_URL_PROD=https://api.cafebite.com
VITE_BASE_SUPER_ADMIN_ID=admin-uuid
```

**Rules:**
- All Vite env vars start with `VITE_`
- Never commit `.env` files
- Use `.env.example` as template
- Different files for dev/staging/prod
- No secrets in client-side env vars (visible to users)

---

## 20. Common Anti-Patterns

[Source: react.dev/learn/you-might-not-need-an-effect](https://react.dev/learn/you-might-not-need-an-effect)

| ❌ Anti-Pattern | ✅ Best Practice |
|----------------|------------------|
| Fetch in useEffect | Use TanStack Query |
| Store server data in useState | Use React Query |
| Multiple useState for modal | Single state object |
| Inline event handlers > 3 lines | Extract to function |
| Index as key | Use unique stable ID |
| Inline styles | Use Tailwind |
| Magic strings | Use constants |
| Native `<select>` | Use Shadcn Select |
| Mutate props | Use callback to parent |
| Refs for non-DOM | Use state |
| Premature optimization | Measure first |
| Global state for everything | State colocation |
| Comments for obvious code | Self-documenting code |

---

## Quick Decision Trees

### Where to put new feature?

```
Is it a new backend module?
└── Yes → Create src/components/<Module>/
└── No
    ├── Is it a new page?
    │   └── Yes → Add to src/components/<Module>/<Module>Index.jsx
    ├── Is it a new shared component?
    │   └── Yes → src/common/
    ├── Is it a new UI primitive?
    │   └── Yes → Don't add (use Shadcn)
    └── Is it a new service?
        └── Yes → src/service/<module>.service.js
```

### How to fetch data?

```
Is data from server?
└── Yes → useQuery (TanStack Query)
└── No
    ├── Is it form data?
    │   └── Yes → react-hook-form
    ├── Does it need to survive refresh?
    │   └── Yes → useSearchParams
    └── Is it UI state?
        └── Yes → useState / useReducer
```

### How to handle errors?

```
Is it an API error?
└── Yes → handleApiError in service → toast in component
└── No
    ├── Is it a form validation error?
    │   └── Yes → Zod schema + formState.errors
    └── Is it a generic error?
        └── Yes → Try-catch + toast + log
```

### When to memo?

```
Is component expensive to render?
└── No → Don't memo
└── Yes
    ├── Receives same props often?
    │   └── Yes → React.memo
    └── Creates objects/functions in render?
        └── Yes → useMemo / useCallback
```

---

## Sources Summary

- [React Official Docs](https://react.dev/)
- [React Router v7 Docs](https://reactrouter.com/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [TanStack Table Docs](https://tanstack.com/table)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [Shadcn/ui Docs](https://ui.shadcn.com/)
- [Radix UI Docs](https://www.radix-ui.com/)
- [Kent C. Dodds - State Management](https://kentcdodds.com/blog/application-state-management-with-react)
- [TkDodo - Practical React Query](https://tkdodo.eu/blog/practical-react-query)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [date-fns Docs](https://date-fns.org/)
- [Vite Docs](https://vitejs.dev/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [bulletproof-react](https://github.com/alan2207/bulletproof-react)
- [Lucide Icons](https://lucide.dev/)
