---
name: eumsops-frontend-rules
description: >
  EUMSOPS project frontend coding standards and conventions. ALWAYS use this skill for any
  React frontend task in the EUMSOPS project — creating components, forms, tables, modals,
  filters, hooks, routes, or any UI work. Covers folder structure, component patterns,
  library choices, UI conventions, form handling, data fetching, state management, and
  agent-specific checklist. Trigger on: "create component", "add form", "add table",
  "add filter", "add modal", "add route", "add page", "frontend task", "UI", "fix component",
  or any React/frontend work in EUMSOPS.
---

# EUMSOPS Frontend Rules Skill

This skill encodes all frontend standards for the EUMSOPS project.
Every AI agent working on EUMSOPS frontend MUST read this skill before writing a single line of code.

---

## Quick Reference Index

| Topic | Section |
|-------|---------|
| Folder & file structure | [→ File Structure](#file-structure) |
| Library stack | [→ Libraries](#library-stack) |
| UI components & buttons | [→ UI Components](#ui-components) |
| Forms | [→ Forms](#forms) |
| Tables | [→ Tables) |
| Filters | [→ Filters](#filters) |
| Modals | [→ Modals) |
| Status / Priority display | [→ Status & Priority](#status--priority) |
| Dates | [→ Dates](#dates) |
| Loaders | [→ Loaders](#loaders) |
| Toasts | [→ Toasts](#toasts) |
| Pagination | [→ Pagination](#pagination) |
| Error / empty / loading states | [→ States](#states) |
| Agent execution checklist | [→ Checklist](#agent-execution-checklist) |

For detailed examples see `references/examples.md`.
For component snippets see `references/snippets.md`.

---

## File Structure

### Module Folder Convention

Every feature/module gets its own folder under the route directory.
**Never** put components flat in a route folder.

```
src/
└── pages/
    └── <ModuleName>/
        └── index.jsx                              ← page entry: orchestrates everything
        │
        └── components/
            │
            ├── <ModuleName>Table/                 ← ALWAYS a folder
            │   ├── index.jsx                      ← assembles table, all states
            │   ├── <ModuleName>Columns.jsx        ← column defs + cell renderers
            │   ├── <ModuleName>RowActions.jsx     ← Edit → Delete → Info buttons
            │   └── <ModuleName>Toolbar.jsx        ← bulk actions, row count
            │
            ├── <ModuleName>Form/                  ← ALWAYS a folder
            │   ├── index.jsx                      ← Dialog wrapper + submit logic
            │   ├── <ModuleName>FormFields.jsx     ← all input fields (column layout)
            │   └── <ModuleName>FormFooter.jsx     ← Submit / Cancel buttons
            │
            ├── <ModuleName>FilterDisplay/         ← folder if 3+ filter inputs
            │   ├── index.jsx                      ← filter row wrapper
            │   ├── <ModuleName>SearchInput.jsx
            │   └── <ModuleName>StatusFilter.jsx
            │
            ├── <ModuleName>FilterModal/           ← folder (shell + filter form)
            │   ├── index.jsx
            │   └── <ModuleName>FilterForm.jsx
            │
            ├── <ModuleName>DeleteDialog.jsx       ← single file (small, focused)
            └── <ModuleName>InfoPanel.jsx          ← single file (folder if has tabs)
        │
        └── hooks/
            └── use<ModuleName>.js                 ← data fetching (react-query)
            └── use<ModuleName>Form.js             ← form logic (react-hook-form + zod)
            └── use<ModuleName>Filter.js           ← filter state
        └── constants/
            └── <moduleName>.constants.js          ← status options, enum labels
        └── validation/
            └── <moduleName>.schema.js             ← Zod schemas: create, update, filter
```

### Component → Sub-Folder Decision Rule

```
Component > ~150 lines?              → folder with index.jsx
Defines internal sub-components?     → folder with index.jsx
Has 2+ distinct UI sections?         → folder with index.jsx
Otherwise                            → single file is fine
```

**Always a folder regardless of size:**
- `<Module>Table/` — always needs Columns + RowActions as separate files
- `<Module>Form/` — always needs FormFields + FormFooter split
- `<Module>FilterModal/` — always needs modal shell + form split

**Golden rule — parent imports ONLY from the folder name, never from inside:**
```js
// ✅ correct
import GsmModemTable from './components/GsmModemTable'
// ❌ never
import GsmModemTable from './components/GsmModemTable/index'
import GsmModemColumns from './components/GsmModemTable/GsmModemColumns'
```

### File Naming Rules

| What | Convention | Example |
|------|-----------|---------|
| Route index | `index.jsx` | `GsmModem/index.jsx` |
| Component folder | PascalCase + module prefix | `GsmModemTable/` |
| Component entry | `index.jsx` inside folder | `GsmModemTable/index.jsx` |
| Sub-components | PascalCase + descriptive suffix | `GsmModemColumns.jsx`, `GsmModemRowActions.jsx` |
| Hooks | camelCase with `use` prefix | `useGsmModem.js` |
| Constants | camelCase + `.constants.js` | `gsmModem.constants.js` |
| Validation | camelCase + `.schema.js` | `gsmModem.schema.js` |
| Filter (display) | `<Module>FilterDisplay/` folder | `GsmModemFilterDisplay/index.jsx` |
| Filter (modal) | `<Module>FilterModal/` folder | `GsmModemFilterModal/index.jsx` |
| Service functions | Match controller name exactly | `getGsmModem`, `updateGsmModem` |

### index.jsx Pattern

The page-level `index.jsx` is the orchestrator — it imports from component folders, never from inside them.

```jsx
// GsmModem/index.jsx
// All imports are from folder names — never from files inside folders
import GsmModemTable from './components/GsmModemTable'         // folder
import GsmModemForm from './components/GsmModemForm'           // folder
import GsmModemFilterDisplay from './components/GsmModemFilterDisplay' // folder
import GsmModemFilterModal from './components/GsmModemFilterModal'     // folder
import GsmModemDeleteDialog from './components/GsmModemDeleteDialog'   // file
import GsmModemInfoPanel from './components/GsmModemInfoPanel'         // file
import { useGsmModem } from './hooks/useGsmModem'
import { useGsmModemFilter } from './hooks/useGsmModemFilter'

export default function GsmModemPage() {
  // orchestrate modal state, pass handlers down to components
}
```

Each component folder's own `index.jsx` handles its internal imports — the page never reaches inside a component folder.

---

## Library Stack

| Purpose | Library | Notes |
|---------|---------|-------|
| Icons | **Lucide React** | Only Lucide — no other icon sets |
| UI components | **Shadcn/ui** | Consistent base components |
| Form handling | **react-hook-form** | All forms |
| Form validation | **Zod** | All form schemas |
| Data fetching | **@tanstack/react-query** | All API calls + server state |
| Tables | **@tanstack/react-table** | All data tables |
| URL params | **nuqs** | URL search param sync |
| Date library | **date-fns** | NEVER use Moment.js |
| Select | **React Select** or custom Shadcn | No native `<select>` |
| Code formatting | Native formatter | No external formatter lib |

---

## UI Components

### Icons
- Always use Lucide icons
- Import individually: `import { Plus, Trash2, Pencil, Info } from 'lucide-react'`

### Buttons

| Button type | Variant / Style | Position |
|-------------|----------------|---------|
| Add Button | Icon + label, top-right of page | Top-right |
| Submit Button | Gradient variant | Form footer |
| Cancel Button | Outline variant | Form footer |
| Apply Button | Indigo color | Filter/form |
| Clear Button | Secondary variant | Filter/form |

```jsx
// Add button — always top-right with icon
<Button className="ml-auto" onClick={handleAdd}>
  <Plus className="mr-2 h-4 w-4" /> Add Device
</Button>

// Submit — gradient
<Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
  Submit
</Button>

// Cancel — outline
<Button variant="outline" onClick={onClose}>Cancel</Button>

// Apply — indigo
<Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Apply</Button>

// Clear — secondary
<Button variant="secondary" onClick={handleClear}>Clear</Button>
```

### Tabs
- Alternate fill and underline tab style (not all-fill, not all-underline)
- Match style of existing Todos panel
- Show `*` mark on all tabs that have incomplete/under-development features

### Status Display
- Use **borderless chip** — no border, soft background color, small rounded pill

```jsx
// Borderless chip
<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
  ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
  {status}
</span>
```

### Priority Display
- Icon first, then text
```jsx
<span className="flex items-center gap-1">
  <ArrowUp className="h-3 w-3 text-red-500" /> High
</span>
```

### Side Panel
- Tab style must match Todos panel
- Each tab renders its own sub-component

### Delete Dialog
- Must show affected/related items before confirming deletion
- Use `AlertDialog` from Shadcn

### "I" (Info) Button
- Every table row action bar includes an Info button
- Clicking opens a side panel or modal with **proper descriptive content** — not empty, not placeholder
- Must show all relevant fields, timestamps, and related data

---

## Forms

### Layout Rules

| Form type | Layout |
|-----------|--------|
| Create form | Single column |
| Update form | Single column |
| Filter form | Row (horizontal) |

### Field Rules
- All fields must have `<label>` elements
- Required fields must show `*` mark visibly
- Use `react-hook-form` with `Controller` for controlled components
- All validation via Zod schema in `validation/<module>.schema.js`

```jsx
// validation/gsmModem.schema.js
import { z } from 'zod'

export const gsmModemSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  simNumber: z.string().min(10, 'SIM number must be at least 10 digits'),
  status: z.enum(['active', 'inactive']),
})

export const gsmModemFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
})
```

```jsx
// hooks/useGsmModemForm.js
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { gsmModemSchema } from '../validation/gsmModem.schema'

export function useGsmModemForm(defaultValues) {
  return useForm({
    resolver: zodResolver(gsmModemSchema),
    defaultValues,
  })
}
```

### Modal State — Single State Object

Never use multiple `useState` for modal open/close + data. Use one state object:

```jsx
const [modalState, setModalState] = useState({
  open: false,
  mode: null,       // 'create' | 'edit' | 'info' | 'delete'
  data: null,
})

const openCreate = () => setModalState({ open: true, mode: 'create', data: null })
const openEdit = (row) => setModalState({ open: true, mode: 'edit', data: row })
const closeModal = () => setModalState({ open: false, mode: null, data: null })
```

---

## Tables

- Use `@tanstack/react-table` for all tables
- Column definitions live in `constants/<module>.constants.js`
- Center-align all cell content
- Action button sequence per row: **Edit → Delete → Info** (always this order)
- Show "Table not found" (not "No data") when empty

```jsx
// Empty state
{table.getRowModel().rows.length === 0 && (
  <div className="py-12 text-center text-muted-foreground">
    Table not found
  </div>
)}
```

---

## Filters

### Client-side Filters
- Use Shadcn components (Input, Select, etc.)
- Display as `<ModuleName>FilterDisplay.jsx` — a row above the table
- Filter position: **left of the Add button**

```jsx
<div className="flex items-center gap-2">
  {/* Filters on left */}
  <GsmModemFilterDisplay filter={filter} onFilterChange={setFilter} />
  {/* Add button on right */}
  <Button className="ml-auto" onClick={handleAdd}>
    <Plus className="mr-2 h-4 w-4" /> Add
  </Button>
</div>
```

### Server-side Filters
- Use modal interface — `<ModuleName>FilterModal.jsx`
- Filter button opens modal, Apply triggers API refetch, Clear resets

---

## Modals

- State managed via single state object (see Forms section)
- Create/Edit use the same `<ModuleName>Form.jsx` — pass `mode` prop
- Delete uses `<ModuleName>DeleteDialog.jsx` with affected items listed
- Info/Detail uses `<ModuleName>InfoPanel.jsx`

---

## Dates

**NEVER use Moment.js. Always use date-fns.**

| Value type | Format | Example |
|-----------|--------|---------|
| Date only | `DD-MM-YYYY` with 3-letter day abbr | `Mon, 14-04-2025` |
| Date + time | `DD-MM-YYYY hh:mm:ss A` | `14-04-2025 03:45:21 PM` |

```js
import { format } from 'date-fns'

// Date only
export const formatDate = (date) =>
  date ? format(new Date(date), 'EEE, dd-MM-yyyy') : '—'

// Datetime
export const formatDateTime = (date) =>
  date ? format(new Date(date), 'dd-MM-yyyy hh:mm:ss aa').replace('am', 'AM').replace('pm', 'PM') : '—'
```

Put these in a shared `utils/date.utils.js` — don't inline format strings.

---

## Loaders

- **Never use the Slack loader**
- Analytics cards: use **bouncing dots** loader
- Other components: use Shadcn `Skeleton` or a spinner
- Add loader wherever data is being fetched — every `isLoading` state must show something

```jsx
// Bouncing dots — for analytics cards
function BouncingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

// In analytics card
{isLoading ? <BouncingDots /> : <span>{value}</span>}
```

---

## Toasts

- Use the project's `utils/toast` utility — never import toast directly
- Show toast on: successful add, successful edit, any error
- Error toasts must show **exact error message** from API response

```js
import { showToast } from '@/utils/toast'  // project util

// Success
showToast.success('Device added successfully')
showToast.success('Device updated successfully')

// Error — show exact message
showToast.error(error?.response?.data?.message || 'Something went wrong')
```

---

## Pagination

- Sync page number and page size with URL search params via `nuqs`
- Pagination state must survive page refresh

```jsx
import { useQueryState, parseAsInteger } from 'nuqs'

const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(10))
```

---

## States

Every API-driven component MUST handle all four states:

| State | What to show |
|-------|-------------|
| Loading | Loader (skeleton / bouncing dots) |
| Success (with data) | The UI |
| Success (empty) | "Table not found" or relevant empty message |
| Error | Toast with exact error message |

```jsx
if (isLoading) return <TableSkeleton />
if (isError) {
  showToast.error(error?.response?.data?.message || 'Failed to load data')
  return null
}
if (!data?.length) return <EmptyState message="Table not found" />
return <DataTable data={data} />
```

---

## Special Components

### Under Development
Show this for any tab or section that is incomplete:

```jsx
function UnderDevelopment() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Construction className="h-10 w-10 mb-3 text-yellow-500" />
      <p className="text-sm font-medium">Under Development</p>
    </div>
  )
}
```

Tabs with incomplete features must also show `*` in the tab label: `Settings *`

---

## Roles & Permissions

- Check role and permission before rendering action buttons and sensitive UI
- Hide (not just disable) buttons the user doesn't have permission for
- When roles/permissions change, verify each affected user's role+permission state

```jsx
const { hasPermission } = useAuth()

{hasPermission('device:edit') && (
  <Button onClick={() => openEdit(row)}>
    <Pencil className="h-4 w-4" />
  </Button>
)}
```

---

## Responsiveness

- UI must be responsive across major screen sizes (mobile, tablet, desktop)
- Test table layouts on narrow viewports — use horizontal scroll if needed
- Graphs and chart UIs must render correctly on all devices

---

## Agent Execution Checklist

Before marking any frontend task as done, verify every item:

### Structure
- [ ] Module folder created under correct route path
- [ ] `index.jsx` exists at module root and imports from component folder names only
- [ ] `<Module>Table/` is a folder with: `index.jsx`, `Columns.jsx`, `RowActions.jsx`
- [ ] `<Module>Form/` is a folder with: `index.jsx`, `FormFields.jsx`, `FormFooter.jsx`
- [ ] `<Module>FilterDisplay/` is a folder (if 3+ filter inputs) or single file
- [ ] `<Module>FilterModal/` is a folder with: `index.jsx`, `FilterForm.jsx`
- [ ] `<Module>DeleteDialog.jsx` and `InfoPanel.jsx` are single files (unless tabs → folder)
- [ ] No component imports from inside another component's folder (only folder-level imports)
- [ ] `hooks/` folder with data + form + filter hooks
- [ ] `constants/` folder with options and enum labels
- [ ] `validation/` folder with Zod schema

### Libraries
- [ ] Only Lucide icons used
- [ ] date-fns used for all dates (no Moment)
- [ ] react-hook-form used for all forms
- [ ] Zod schema used for all validation
- [ ] tanstack/react-query for all API calls
- [ ] nuqs for URL param sync (pagination + filters)
- [ ] Shadcn components used throughout

### UI
- [ ] Add button: top-right with icon
- [ ] Submit: gradient variant
- [ ] Cancel: outline variant
- [ ] Apply: indigo color
- [ ] Clear: secondary variant
- [ ] Status displayed as borderless chip
- [ ] Priority displayed as icon + text
- [ ] Table action order: Edit → Delete → Info
- [ ] Table content center-aligned
- [ ] Tab `*` mark on incomplete tabs

### Forms
- [ ] Single column for Create/Update
- [ ] Row layout for Filter
- [ ] All fields have labels
- [ ] Required fields marked with `*`
- [ ] Modal state uses single state object

### States
- [ ] Loading state shows loader
- [ ] Empty state shows "Table not found"
- [ ] Error state shows exact toast
- [ ] Success shows toast on add/edit

### Dates
- [ ] All dates formatted as `EEE, dd-MM-yyyy`
- [ ] All datetimes formatted as `dd-MM-yyyy hh:mm:ss A`

### Other
- [ ] "I" button opens info panel with proper content
- [ ] Delete dialog shows affected items
- [ ] Under Development component used for incomplete sections
- [ ] Role/permission checks applied
- [ ] Loader present on every loading state (no Slack loader)
- [ ] Bouncing dots used in analytics cards
- [ ] Responsive on major screen sizes
- [ ] All click events tested and working
- [ ] Default active view/status set
- [ ] Inactive data logic handles dependencies
- [ ] Graphs render correctly on all devices

---

## References

- `references/snippets.md` — copy-paste code snippets for common patterns
- `references/folder-example.md` — concrete folder tree example for GsmModem module