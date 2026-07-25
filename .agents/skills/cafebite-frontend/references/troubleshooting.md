# 11 - Troubleshooting

> Common errors, fixes, and debugging steps.

---

## Sources

- [React - Error Boundaries](https://react.dev/reference/react/ErrorBoundary)
- [TanStack Query - Troubleshooting](https://tanstack.com/query/latest/docs/framework/react/guides/testing)
- [Vite - Troubleshooting](https://vitejs.dev/guide/troubleshooting.html)
- [React Hook Form - Errors](https://react-hook-form.com/docs/useform/formstate)

---

## React Errors

### "Cannot read property of undefined"

**Cause**: Accessing property of undefined object (often from API response not yet loaded).

**Fix**: Optional chaining + fallback:
```jsx
// ❌ WRONG
const name = user.profile.name;

// ✅ CORRECT
const name = user?.profile?.name ?? '—';
```

### "Too many re-renders"

**Cause**: Calling setState in render or in useEffect without dependencies.

**Fix**: Move setState to event handler or use `useEffect` with proper dependencies:
```jsx
// ❌ WRONG
function Component() {
  const [count, setCount] = useState(0);
  setCount(count + 1);  // Re-render loop
  return <div>{count}</div>;
}

// ✅ CORRECT
function Component() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### "Warning: Each child in a list should have a unique key prop"

**Cause**: Missing or non-unique `key` prop in list.

**Fix**: Use unique stable IDs (not index):
```jsx
// ❌ WRONG
{items.map((item, index) => <Item key={index} {...item} />)}

// ✅ CORRECT
{items.map((item) => <Item key={item.id} {...item} />)}
```

### "Warning: Can't perform a React state update on an unmounted component"

**Cause**: setState called after component unmounted (e.g., in async callback).

**Fix**: Use AbortController or cleanup function:
```jsx
useEffect(() => {
  const controller = new AbortController();
  
  fetchData(controller.signal);
  
  return () => controller.abort();
}, []);
```

### "Objects are not valid as a React child"

**Cause**: Rendering an object instead of string/element.

**Fix**: Convert to string or extract property:
```jsx
// ❌ WRONG
<span>{user}</span>

// ✅ CORRECT
<span>{user.name}</span>
```

---

## TanStack Query Errors

### "Query is not defined" / "useQuery is not a function"

**Cause**: Missing `QueryClientProvider` in component tree.

**Fix**: Wrap app in QueryClientProvider:
```jsx
// main.jsx
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Data not updating after mutation

**Cause**: Forgot to invalidate the query.

**Fix**: Invalidate on success:
```jsx
const mutation = useMutation({
  mutationFn: updateCategory,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });  // ← Add this
  },
});
```

### "Failed to fetch" / CORS error

**Cause**: API not reachable or CORS not configured.

**Fix**:
1. Check backend is running
2. Check `VITE_BASE_URL_LOCAL` in `.env`
3. Check backend CORS config includes your frontend URL
4. Check `withCredentials: true` if using cookies

### "Network Error" on every request

**Cause**: Wrong base URL or backend not running.

**Fix**:
```javascript
// utils/api.js
const BASE_URL = isProduction 
  ? import.meta.env.VITE_BASE_URL_PROD 
  : import.meta.env.VITE_BASE_URL_LOCAL;

console.log('API Base URL:', BASE_URL);  // Debug
```

### Query refetches too often

**Cause**: `staleTime: 0` (default) means always stale.

**Fix**: Set appropriate staleTime:
```jsx
useQuery({
  queryKey: ['categories'],
  queryFn: getCategories,
  staleTime: 5 * 60 * 1000,  // 5 minutes
});
```

---

## React Hook Form Errors

### "form.handleSubmit is not a function"

**Cause**: Using `useForm` incorrectly.

**Fix**:
```jsx
const { register, handleSubmit } = useForm();

// Use with form.handleSubmit
<form onSubmit={form.handleSubmit(onSubmit)}>
```

### Validation not working

**Cause**: Forgot `mode` or schema not set up.

**Fix**:
```jsx
const form = useForm({
  resolver: zodResolver(schema),  // ← Add this
  defaultValues,
  mode: "onSubmit",  // or "onChange" for live
});
```

### "ref is not a function" with Controller

**Cause**: Using `register` with controlled component or vice versa.

**Fix**:
```jsx
// ❌ WRONG - register on Shadcn Select
<Select {...register("category")}>

// ✅ CORRECT - use Controller
<Controller
  name="category"
  control={control}
  render={({ field }) => (
    <Select onValueChange={field.onChange} value={field.value}>
      ...
    </Select>
  )}
/>
```

### Form not resetting

**Cause**: Using `setValue` instead of `reset`.

**Fix**:
```jsx
// ❌ WRONG
form.setValue('name', 'new value');

// ✅ CORRECT
form.reset({ name: 'new value', status: 1 });
```

### "Cannot read property 'message' of undefined"

**Cause**: Accessing error before validation runs.

**Fix**: Check field has been touched:
```jsx
{errors.name?.message}

// OR for show after submit
{formState.isSubmitted && errors.name?.message}
```

---

## React Router Errors

### "useNavigate() may be used only in the context of a <Router>"

**Cause**: Component using router hooks not inside `<BrowserRouter>`.

**Fix**: Ensure `<BrowserRouter>` wraps the app:
```jsx
<BrowserRouter>
  <App />
</BrowserRouter>
```

### Page not updating on route change

**Cause**: Using `useEffect` with wrong dependencies.

**Fix**: Use `useLocation` or `useParams`:
```jsx
function Page() {
  const { id } = useParams();  // Re-renders when id changes
  useEffect(() => {
    fetchData(id);
  }, [id]);
}
```

### 404 on all routes

**Cause**: `*` route placed before other routes.

**Fix**: Put `*` route last:
```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="*" element={<NotFound />} />  {/* ← Last */}
</Routes>
```

---

## Vite Errors

### "Cannot find module '@/...'"

**Cause**: Path alias not configured in `jsconfig.json` / `tsconfig.json`.

**Fix**: Add to `jsconfig.json`:
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

### "Port 5173 is already in use"

**Fix**: Kill the process or use different port:
```bash
# Kill
lsof -ti:5173 | xargs kill -9

# Or change port
npm run dev -- --port 3000
```

### "Failed to load module script"

**Cause**: Browser cache or wrong file extension.

**Fix**:
1. Clear browser cache
2. Restart Vite (`Ctrl+C` then `npm run dev`)
3. Delete `node_modules/.vite` cache:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### "import.meta.env is undefined"

**Cause**: Missing `VITE_` prefix on env variable.

**Fix**: Rename `.env` variable:
```env
# ❌ WRONG
API_URL=http://localhost:3002

# ✅ CORRECT
VITE_API_URL=http://localhost:3002
```

---

## Axios Errors

### "Request failed with status code 401"

**Cause**: Token expired or invalid.

**Fix**: Response interceptor should clear tokens and redirect:
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### "Network Error" with CORS

**Cause**: Backend CORS not configured.

**Fix** (backend):
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

### Multipart upload fails

**Cause**: Wrong Content-Type.

**Fix**:
```javascript
// ❌ WRONG
await api.post('/upload', formData);

// ✅ CORRECT
await api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

---

## Shadcn/ui Errors

### "DialogContent is not a function"

**Cause**: Component not properly exported.

**Fix**: Check import:
```jsx
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
```

### Form validation errors not showing

**Cause**: Missing `FormMessage` component.

**Fix**:
```jsx
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />  {/* ← Add this */}
    </FormItem>
  )}
/>
```

### Toast not appearing

**Cause**: Missing `<ToastContainer />` or `<Toaster />` in app.

**Fix**: Add to `App.jsx`:
```jsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

<>
  {/* routes */}
  <ToastContainer limit={3} />
  <Toaster position="top-center" />
</>
```

---

## Build Errors

### "Module not found" during build

**Cause**: Importing a file that doesn't exist or wrong path.

**Fix**:
1. Check file exists
2. Check path is correct
3. Check file extension is included
4. Check case sensitivity (Linux is case-sensitive)

### "Out of memory" during build

**Fix**:
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Build succeeds but app crashes on load

**Cause**: Environment variables not set in production.

**Fix**: Set env vars in deployment platform (Vercel, Netlify, etc.).

---

## Common Debugging Steps

### 1. Check Console

Open browser DevTools → Console tab. Look for:
- Red errors
- Yellow warnings
- Network errors
- React warnings

### 2. Check Network Tab

- Verify API call is made
- Check request headers (auth token present?)
- Check response status
- Check response body

### 3. Check React Query Devtools

```jsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### 4. Use `console.log` Strategically

```jsx
function Component({ data }) {
  console.log('Component rendered with:', data);
  
  return <div>{data?.name}</div>;
}
```

### 5. Use React DevTools

- Inspect component tree
- Check props and state
- Profile performance
- Find unnecessary re-renders

### 6. Use Vite Error Overlay

Vite shows errors directly in the browser. Read the error message and stack trace.

### 7. Check `useEffect` Dependencies

If a value is used in `useEffect`, it should be in the dependency array:

```jsx
useEffect(() => {
  fetchData(id);
}, [id]);  // ← id must be here
```

---

## Performance Issues

### Page loads slowly

**Possible causes:**
- Large bundle (use code splitting)
- Slow API (check backend)
- Too many requests (combine, cache, paginate)
- Heavy computation in render (useMemo)

**Debug**:
```jsx
<Profiler id="MyComponent" onRender={(id, phase, ms) => console.log(`${id} ${phase} ${ms}ms`)}>
  <MyComponent />
</Profiler>
```

### List renders slowly

**Cause**: Too many items, no virtualization.

**Fix**: Use TanStack Virtual:
```jsx
import { useVirtualizer } from '@tanstack/react-virtual';
```

### Form lag on input

**Cause**: Controlled inputs cause re-render on every keystroke.

**Fix**: Use `register` (uncontrolled) instead of `value` + `onChange`.

---

## Debugging Checklist

When something doesn't work, check:

- [ ] Console for errors
- [ ] Network tab for failed requests
- [ ] React DevTools for component state
- [ ] React Query Devtools for query state
- [ ] Environment variables (correct values?)
- [ ] Import paths (use `@/` alias)
- [ ] Service function (returns correct data?)
- [ ] Auth tokens (present, not expired?)
- [ ] Backend is running
- [ ] CORS configured
- [ ] Cache cleared (browser, Vite)

---

## Emergency Fixes

### App completely broken

```bash
# 1. Clear all caches
rm -rf node_modules/.vite
rm -rf node_modules
rm package-lock.json

# 2. Reinstall
npm install

# 3. Restart
npm run dev
```

### All API calls failing

```javascript
// Add to utils/api.js for debugging
api.interceptors.request.use((config) => {
  console.log('Request:', config.method, config.url, config.headers);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Error:', error.response?.status, error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);
```

### State not updating

```javascript
// Add to component
useEffect(() => {
  console.log('State changed:', state);
}, [state]);
```

---

## Best Practice Checklist

- [ ] Always check console first
- [ ] Use React DevTools and React Query Devtools
- [ ] Add `key` to all list items
- [ ] Use proper error boundaries
- [ ] Invalidate queries after mutations
- [ ] Use Zod schemas for validation
- [ ] Handle loading and error states
- [ ] Don't put tokens in URLs or logs
- [ ] Test in production build before deploying
- [ ] Keep dependencies up to date
- [ ] Use semantic HTML for accessibility
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Test with slow network (throttle in DevTools)
