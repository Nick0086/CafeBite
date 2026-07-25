# 05 - Component Patterns

> Best practices from React official docs on thinking in React and component design.

---

## Sources

- [React - Thinking in React](https://react.dev/learn/thinking-in-react)
- [React - Your First Component](https://react.dev/learn/your-first-component)
- [React - Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)
- [React - Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Kent C. Dodds - Component Patterns](https://kentcdodds.com/blog/advanced-react-patterns)
- [Shadcn/ui - Components](https://ui.shadcn.com/docs/components)

---

## Thinking in React: 5 Steps

[Source: React - Thinking in React](https://react.dev/learn/thinking-in-react)

### Step 1: Break UI into Component Hierarchy

Draw boxes around every component and name them. Apply the **single responsibility principle**: each component does one thing.

```
CategoriesIndex
├── Header (title + add button)
├── FilterRow (search + status filter)
└── CategoryTable
    ├── TableHeader (column titles)
    └── TableBody
        └── CategoryRow (one per item)
            ├── CategoryName
            ├── CategoryCount
            ├── CategoryStatus (Chip)
            └── ActionButtons (Edit, Delete, Info)
```

**Reference: `frontend/src/components/Menu/Categories/CategoriesIndex.jsx:155-186`**

```jsx
return (
  <div className="w-full">
    <div className="px-2 my-2 flex flex-row flex-wrap justify-between items-center gap-2">
      <h2 className="text-2xl font-medium">Menu Categories</h2>
      <Button onClick={() => handleOpenModal({ isOpen: true, isEdit: false, data: null })}>
        <Plus size={18} />
        <span className="text-sm">Add Category</span>
      </Button>
    </div>
    <div className="border-y border-gray-200 p-2">
      <CommonTableToolbar table={tableInstance} ... />
    </div>
    <div className="border-y border-gray-200">
      <CommonTable table={tableInstance} ... />
    </div>
  </div>
);
```

### Step 2: Build Static Version First

Start with the data model and components, without interactivity. Add state last.

### Step 3: Find Minimal State Representation

For each piece of data, ask:
- Does it **remain unchanged** over time? → Not state
- Is it **passed in from parent** via props? → Not state
- **Can you compute it** from existing state/props? → Not state

What's left is state.

### Step 4: Identify Where State Lives

For each piece of state, find the closest common parent of all components that need it.

### Step 5: Add Inverse Data Flow

Pass setter functions down to children so they can update parent state.

---

## Component Categories

| Category | Purpose | Examples | State |
|----------|---------|----------|-------|
| **Page (Container)** | Orchestrates, fetches data | `CategoriesIndex`, `MenuItemsIndex` | Data fetching, modal state |
| **Layout** | Shared UI structure | `Sidebar`, `DashboardLayout` | None or layout state |
| **Presentational** | Pure UI, receives props | `CategoryChip`, `EmptyState` | None |
| **Form** | Wraps Dialog + form | `CategoriesForm`, `MenuItemForm` | Form state (RHF) |
| **UI Primitive** | Shadcn components | `Button`, `Dialog`, `Input` | Internal only |

---

## Container vs Presentational Components

[Source: Kent C. Dodds - Component Patterns](https://kentcdodds.com/blog/advanced-react-patterns)

```jsx
// ✅ CONTAINER: Handles data, state, side effects
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

// ✅ PRESENTATIONAL: Pure UI, only props
function CategoryListView({ categories, onEdit, onDelete }) {
  return (
    <div>
      {categories.map((cat) => (
        <CategoryRow
          key={cat.id}
          category={cat}
          onEdit={() => onEdit(cat)}
          onDelete={() => onDelete(cat.id)}
        />
      ))}
    </div>
  );
}
```

**Benefits:**
- Container is testable with mock data
- Presentational is testable with prop snapshots
- Easy to reuse presentational with different containers

---

## Composition Patterns

[Source: React - Passing JSX as Children](https://react.dev/learn/passing-props-to-a-component)

### Children Prop

```jsx
// Reusable container component
function Card({ children, title }) {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

// Usage
<Card title="Statistics">
  <CategoryStats data={data} />
  <MenuItemStats data={data} />
</Card>
```

### Render Props

```jsx
function DataFetcher({ url, render }) {
  const { data, isLoading } = useQuery({ queryKey: [url], queryFn: () => api.get(url) });
  return render({ data, isLoading });
}

// Usage
<DataFetcher
  url="/categories"
  render={({ data, isLoading }) => (
    isLoading ? <Skeleton /> : <CategoryList data={data} />
  )}
/>
```

### Compound Components

```jsx
// Tabs with sub-components
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview"><OverviewPanel /></TabsContent>
  <TabsContent value="settings"><SettingsPanel /></TabsContent>
</Tabs>
```

---

## Props Best Practices

[Source: React - Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)

### Don't Pass Too Many Props

```jsx
// ❌ WRONG: Too many props
<Card 
  title="..." 
  subtitle="..." 
  footer="..." 
  header="..." 
  image="..." 
  onClick={() => {}} 
  onEdit={() => {}} 
  onDelete={() => {}}
/>
```

### Group Related Props

```jsx
// ✅ CORRECT: Group related props
<Card 
  header={{ title: "...", subtitle: "..." }}
  body="..."
  footer={...}
  actions={{ onEdit: () => {}, onDelete: () => {} }}
/>
```

### Use Spreading for Forwarded Props

```jsx
function Button({ variant, size, className, ...rest }) {
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...rest}
    />
  );
}
```

### Don't Mutate Props

```jsx
// ❌ WRONG
function ItemList({ items }) {
  items.push({ id: Date.now() }); // Mutation!
  return <ul>...</ul>;
}

// ✅ CORRECT
function ItemList({ items, onAdd }) {
  return <ul onClick={onAdd}>...</ul>;
}
```

---

## Memoization for Performance

[Source: React - memo](https://react.dev/reference/react/memo)

### When to Use React.memo

```jsx
// ✅ Use when:
// 1. Component is expensive to render
// 2. Receives same props often
// 3. Parent re-renders frequently

const ExpensiveRow = React.memo(function ExpensiveRow({ data, onEdit }) {
  return <tr>...</tr>;
});

// With custom comparison
const ExpensiveRow = React.memo(
  function ExpensiveRow({ data }) { ... },
  (prevProps, nextProps) => prevProps.data.id === nextProps.data.id
);
```

### When NOT to Use React.memo

```jsx
// ❌ Don't use for:
// 1. Simple components (cost > benefit)
// 2. Always-changing props
// 3. Premature optimization (measure first!)

const SimpleButton = React.memo(({ onClick, children }) => (
  <button onClick={onClick}>{children}</button>
));
// This is unnecessary - button renders are cheap
```

### Profile Before Optimizing

[Source: React - Profiler](https://react.dev/reference/react/Profiler)

```jsx
import { Profiler } from "react";

<Profiler id="CategoryTable" onRender={(id, phase, actualDuration) => {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
}}>
  <CategoryTable />
</Profiler>
```

---

## Component File Structure

```jsx
// 1. Imports - external
import React, { useState, useEffect, memo } from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Imports - internal (alphabetical by path)
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

// 3. Types/constants
const STATUS_OPTIONS = [
  { label: "Active", value: 1 },
  { label: "Inactive", value: 0 },
];

// 4. Sub-components (if small)
function StatusChip({ status }) {
  return <Chip color={status === 1 ? "green" : "red"}>{status}</Chip>;
}

// 5. Main component
function CategoryList() {
  const { data } = useCategories();
  return <div>...</div>;
}

// 6. Display name for debugging
CategoryList.displayName = "CategoryList";

// 7. Export
export default CategoryList;
```

---

## Common Anti-Patterns

### ❌ Don't fetch in useEffect

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
  
  // No caching, no deduplication, no retry, no background refetch
}

// ✅ CORRECT
function CategoryList() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}
```

### ❌ Don't use inline function for stable callbacks

```jsx
// WRONG - new function on every render
<CategoryRow onEdit={() => handleEdit(row)} />

// ✅ CORRECT - memoized
const handleEdit = useCallback((row) => { ... }, []);
<CategoryRow onEdit={handleEdit} />
```

### ❌ Don't pass entire objects to memoized children

```jsx
// WRONG - causes re-render even if unchanged
<CategoryRow category={category} onEdit={onEdit} />

// ✅ CORRECT - pass primitives, child looks up by id
<CategoryRow categoryId={category.id} onEdit={onEdit} />
```

### ❌ Don't use index as key for dynamic lists

```jsx
// WRONG
{items.map((item, index) => <Item key={index} {...item} />)}

// ✅ CORRECT
{items.map((item) => <Item key={item.id} {...item} />)}
```

---

## Current Project Patterns

**Reference: `frontend/src/components/Menu/Categories/CategoriesIndex.jsx`**

The project follows a **single-page container** pattern:
- `Index.jsx` file is the container
- It owns data fetching, state, and event handlers
- Sub-components (`CommonTable`, `CommonTableToolbar`, `CategoriesForm`) are presentational
- Modal state is in the container, form state is in the form component

**Reference: `frontend/src/components/Menu/MenuItems/MenuItemsIndex.jsx:17-43`**

Uses `memo` for sub-components:
```jsx
const Header = memo(({ onAddClick }) => (...));
const MemoizedMenuTable = memo(MenuTable);
const MemoizedMenuCard = memo(MenuCard);
```

---

## Checklist for New Component

- [ ] Single responsibility - one clear purpose
- [ ] Props interface is minimal and focused
- [ ] State colocation: state lives in the component that needs it
- [ ] Container fetches data, presents pass through
- [ ] Side effects in `useEffect` only when React Query can't help
- [ ] Lists use stable, unique keys (not index)
- [ ] Memo only when measured to be beneficial
- [ ] No prop drilling beyond 2-3 levels (use Context if needed)
- [ ] Display name set for debugging
- [ ] All imports ordered: external → internal → relative
- [ ] No inline business logic in JSX (extract functions)
- [ ] No `dangerouslySetInnerHTML` (use safe alternatives)
- [ ] Accessible: proper labels, ARIA, keyboard support
