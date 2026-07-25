# 07 - Tables

> Best practices from TanStack Table v8 documentation and modern data table architecture.

---

## Sources

- [TanStack Table - Introduction](https://tanstack.com/table/v8/docs/introduction)
- [TanStack Table - Column Definitions](https://tanstack.com/table/v8/docs/api/core/column-def)
- [TanStack Table - Filtering](https://tanstack.com/table/v8/docs/guide/filters)
- [TanStack Table - Sorting](https://tanstack.com/table/v8/docs/guide/sorting)
- [TanStack Table - Pagination](https://tanstack.com/table/v8/docs/guide/pagination)
- [TanStack Table - Row Models](https://tanstack.com/table/v8/docs/guide/row-models)
- [Shadcn/ui - Data Table](https://ui.shadcn.com/docs/components/data-table)
- [AG Grid - When to Use](https://www.ag-grid.com/react-data-grid/getting-started/)

---

## Why TanStack Table?

[Source: TanStack Table - Introduction](https://tanstack.com/table/v8/docs/introduction)

> "Headless UI for Building Powerful Tables & Datagrids"

- **Framework agnostic** - works with React, Vue, Solid, etc.
- **Headless** - no styles, you bring your own
- **TypeScript-first** - best type inference
- **Lightweight** - ~15KB minified
- **Extensible** - custom cell renderers, filter functions, sort algorithms
- **Tree-shakeable** - only import what you use

---

## Core Concepts

### Table Instance

```jsx
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel } from "@tanstack/react-table";

const table = useReactTable({
  data,
  columns,
  state: { sorting, columnFilters, pagination },
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});
```

### Row Models

[Source: TanStack Table - Row Models](https://tanstack.com/table/v8/docs/guide/row-models)

| Row Model | Purpose |
|-----------|---------|
| `getCoreRowModel()` | Required - basic row access |
| `getSortedRowModel()` | Sort by column |
| `getFilteredRowModel()` | Filter by column value |
| `getPaginationRowModel()` | Paginate visible rows |
| `getFacetedRowModel()` | Get unique values for filters |
| `getFacetedUniqueValues()` | Get count of unique values |
| `getExpandedRowModel()` | For nested/expandable rows |
| `getSelectedRowModel()` | For row selection |

**Rule**: Only include the row models you actually use.

---

## Column Definitions

[Source: TanStack Table - Column Definitions](https://tanstack.com/table/v8/docs/api/core/column-def)

**Reference: `frontend/src/components/Menu/Categories/CategoriesIndex.jsx:55-105`**

```jsx
const columns = useMemo(() => [
  {
    // Accessor key (data field)
    accessorKey: "name",
    
    // Header text
    header: "Category Name",
    
    // Custom cell renderer
    cell: ({ cell, row }) => <span>{cell.getValue()}</span>,
    
    // Custom filter function
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    
    // Enable sorting
    enableSorting: true,
    
    // Custom sort function
    sortingFn: "alphanumeric",
    
    // Column metadata
    meta: {
      width: "w-3/12",
      align: "text-start",
    },
  },
  {
    // Action column (no accessor)
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button onClick={() => handleEdit(row.original)}>Edit</Button>
        <Button onClick={() => handleDelete(row.original)}>Delete</Button>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
], [handleEdit, handleDelete]);
```

**Important**: Always `useMemo` the columns array!

---

## Cell Renderers

```jsx
// Text with currency
{
  accessorKey: "price",
  header: "Price",
  cell: ({ cell }) => (
    <div className="flex items-center gap-1">
      <span>{permissions?.currency_symbol}</span>
      <span>{cell.getValue()}</span>
    </div>
  ),
}

// Status as Chip
{
  accessorKey: "status",
  header: "Status",
  cell: ({ cell }) => 
    cell.getValue() === 1 ? (
      <Chip color="green" variant="light" border="none">Active</Chip>
    ) : (
      <Chip color="red" variant="light" border="none">Inactive</Chip>
    ),
}

// Custom: row index
{
  header: "Sr No",
  cell: ({ row }) => row.index + 1,
}

// Image
{
  accessorKey: "image",
  header: "Image",
  cell: ({ cell }) => (
    <img src={cell.getValue()} alt="" className="h-10 w-10 rounded" />
  ),
}

// Date formatted
{
  accessorKey: "createdAt",
  header: "Created",
  cell: ({ cell }) => formatDate(cell.getValue()),
}
```

---

## Sorting

[Source: TanStack Table - Sorting](https://tanstack.com/table/v8/docs/guide/sorting)

```jsx
const [sorting, setSorting] = useState([]);

const table = useReactTable({
  data,
  columns,
  state: { sorting },
  onSortingChange: setSorting,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});

// In header
<th onClick={column.getToggleSortingHandler()}>
  {column.columnDef.header}
  {column.getIsSorted() === 'asc' ? ' ▲' : column.getIsSorted() === 'desc' ? ' ▼' : ''}
</th>
```

**Reference: `frontend/src/common/Table/CommonTable.jsx:36-49`**

```jsx
{header?.isPlaceholder ? null : (
  <div>
    {flexRender(header.column.columnDef.header, header.getContext())}
    {(header?.column?.columnDef?.isSort && header?.column?.getIsSorted()) ? (
      header?.column?.getIsSorted() === 'asc' ? '▲' : '▼'
    ) : null}
  </div>
)}
```

---

## Filtering

[Source: TanStack Table - Filtering](https://tanstack.com/table/v8/docs/guide/filters)

### Client-Side Filtering

```jsx
const [columnFilters, setColumnFilters] = useState([]);

const table = useReactTable({
  data,
  columns,
  state: { columnFilters },
  onColumnFiltersChange: setColumnFilters,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
});

// Search input
<Input
  value={table.getColumn("name")?.getFilterValue() ?? ""}
  onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
  placeholder="Filter by name..."
/>
```

### Server-Side Filtering (Manual Pagination)

**Reference: `frontend/src/components/ClinetSupport/feedback/FeedBackIndex.jsx:237-249`**

```jsx
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });

const table = useReactTable({
  data: serverData,
  rowCount: parseInt(serverData?.pagination?.total) || 0,
  columns,
  state: { pagination },
  onPaginationChange: setPagination,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  manualPagination: true,  // ← Server handles pagination
});
```

### Custom Filter Function

```jsx
{
  accessorKey: "price",
  header: "Price",
  filterFn: (row, id, filterValue) => {
    try {
      const { value, operator } = JSON.parse(filterValue);
      const rowValue = parseFloat(row.getValue(id));
      switch (operator) {
        case "lessThan": return rowValue < value;
        case "greaterThan": return rowValue > value;
        default: return rowValue === value;
      }
    } catch {
      return true;
    }
  },
}
```

---

## Pagination

[Source: TanStack Table - Pagination](https://tanstack.com/table/v8/docs/guide/pagination)

### Client-Side

```jsx
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });

const table = useReactTable({
  data,
  columns,
  state: { pagination },
  onPaginationChange: setPagination,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

// Navigation
<Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
  Previous
</Button>
<Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
  Next
</Button>
<span>
  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
</span>
```

### Server-Side (with React Query)

**Reference: `frontend/src/components/ClinetSupport/feedback/FeedBackIndex.jsx:31-34`**

```jsx
const { data, isLoading } = useQuery({
  queryKey: ['feedback', pagination.pageSize, pagination.pageIndex],
  queryFn: () => getClientFeedback({
    limit: pagination.pageSize,
    page: pagination.pageIndex + 1,
  }),
});

const table = useReactTable({
  data: data?.data || [],
  rowCount: parseInt(data?.pagination?.total) || 0,
  // ...
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
});
```

---

## URL-Based Pagination (Best Practice)

[Source: React Router - URL Search Params](https://reactrouter.com/start/declarative/search-params)

```jsx
import { useQueryState, parseAsInteger } from "nuqs";

function CategoryList() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(25));
  
  // Pass to API
  const { data } = useQuery({
    queryKey: ['categories', { page, pageSize }],
    queryFn: () => getCategories({ page, limit: pageSize }),
  });
  
  // Pagination state survives refresh, shareable URLs
}
```

---

## Complete Table Component Pattern

**Reference: `frontend/src/components/Menu/Categories/CategoriesIndex.jsx:107-129`**

```jsx
function CategoryTable() {
  // State
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([{ id: "status", value: [1] }]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  
  // Data
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
  
  // Columns - memoized
  const columns = useMemo(() => [
    { header: 'Sr No', accessorKey: 'id', cell: ({ row }) => row.index + 1 },
    { header: 'Category', accessorKey: 'name' },
    { header: 'Count', accessorKey: 'menu_item_count' },
    { header: 'Status', accessorKey: 'status', cell: ({ cell }) => /* Chip */ },
    { id: 'actions', header: 'Actions', cell: ({ row }) => /* buttons */ },
  ], [handleEdit]);
  
  // Table instance
  const table = useReactTable({
    columns,
    data: data?.categories || [],
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });
  
  // Loading state
  if (isLoading) return <TableSkeleton />;
  
  // Error state
  if (error) return <ErrorState onRetry={refetch} />;
  
  // Empty state
  if (!data?.categories?.length) return <EmptyState message="No categories found" />;
  
  // Render
  return <CommonTable table={table} />;
}
```

---

## Common Table Component

**Reference: `frontend/src/common/Table/CommonTable.jsx`**

The project has a `CommonTable` that renders a TanStack Table instance with consistent styling:

```jsx
<CommonTable
  table={tableInstance}
  tableStyle="h-[60dvh]"
  tableHeadRowStyle="bg-indigo-50/20"
  tableBodyRowStyle="bg-transparent hover:bg-indigo-50/50"
  selectRow={selectedId}  // For highlighting
/>
```

It handles:
- Sticky header
- Empty state ("No Data")
- Striped rows (optional)
- Tooltips on headers
- Sort indicators (▲/▼)
- Tooltip placeholders

---

## Best Practice: Empty States

[Source: Shadcn/ui - Empty](https://ui.shadcn.com/docs/components/empty)

```jsx
function EmptyState({ message = "No data found", icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-10 w-10 text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Usage
if (!data?.length) {
  return <EmptyState message="No categories found" />;
}
```

**Project rule**: Show "Table not found" (not "No data") when empty.

---

## Best Practice: Loading States

[Source: Shadcn/ui - Skeleton](https://ui.shadcn.com/docs/components/skeleton)

```jsx
function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
```

**Reference: Current project uses `GoogleStyleLoader` for full-page load and `Skeleton` for inline.**

---

## Performance Optimization

### Virtualization for Large Tables

[Source: TanStack Virtual](https://tanstack.com/virtual)

```jsx
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualTable() {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  return (
    <div ref={parentRef} className="h-[500px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {rows[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Memoize Columns

```jsx
// ✅ ALWAYS useMemo columns
const columns = useMemo(() => [...], [dependencies]);

// ❌ WRONG - recreates on every render
const columns = [...];
```

### Memoize Cell Renderers

```jsx
// For complex cells, extract to component
const StatusCell = memo(({ status }) => {
  return status === 1 ? <Chip>Active</Chip> : <Chip>Inactive</Chip>;
});

{
  accessorKey: "status",
  cell: ({ cell }) => <StatusCell status={cell.getValue()} />,
}
```

---

## Current Project Table Implementations

| Module | Table Pattern | Notes |
|--------|--------------|-------|
| **Categories** | Client-side table, manual filter state | Simple CRUD |
| **Menu Items** | Client-side table, custom price filter | Image column + currency |
| **Feedback** | Server-side pagination, manual mode | Pagination via API |
| **QR Codes** | Grid view (not table) | Print + select + filter |
| **Templates** | Custom drag-drop | Not a traditional table |

---

## Common Anti-Patterns

### ❌ Don't recreate columns on every render

```jsx
// WRONG
const table = useReactTable({
  columns: [...],  // New array every render
  data,
});

// CORRECT
const columns = useMemo(() => [...], []);
const table = useReactTable({ columns, data });
```

### ❌ Don't use uncontrolled filters

```jsx
// WRONG
const [search, setSearch] = useState("");
// Filter happens outside table

// CORRECT
const table = useReactTable({
  state: { columnFilters: [{ id: "name", value: search }] },
  onColumnFiltersChange: setColumnFilters,
  // ...
});
```

### ❌ Don't mix client and server pagination

```jsx
// WRONG - both enabled
const table = useReactTable({
  getPaginationRowModel: getPaginationRowModel(),  // Client
  manualPagination: true,  // Server
});

// CORRECT - pick one
const table = useReactTable({
  manualPagination: true,
  // No getPaginationRowModel for server-side
});
```

### ❌ Don't forget stable keys

```jsx
// WRONG
<table.getRowModel().rows.map((row) => (
  <tr key={row.id}>...</tr>  // row.id is generated by TanStack - OK
))

// CORRECT for data with custom IDs
data.map((item) => <tr key={item.id}>...</tr>)
```

---

## Best Practice Checklist

- [ ] Always `useMemo` the columns array
- [ ] Always `useMemo` the data (if computed)
- [ ] Use `useReactTable` for table instance
- [ ] Define columns outside or memoize
- [ ] Cell renderers for complex content
- [ ] Custom filter functions when needed
- [ ] Server-side pagination with `manualPagination: true`
- [ ] Loading state (skeleton or spinner)
- [ ] Empty state (not just empty table)
- [ ] Error state with retry
- [ ] Sortable columns have visual indicators
- [ ] Action column has consistent button order (Edit → Delete → Info)
- [ ] All cells center-aligned
- [ ] Stable, unique keys for all rows
- [ ] Virtualization for 100+ rows
- [ ] No pagination state in URL for SSR apps (use searchParams for SPA)
