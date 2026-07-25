# 08 - UI Conventions

> Best practices from Shadcn/ui, Radix UI, and modern React UI design.

---

## Sources

- [Shadcn/ui - Components](https://ui.shadcn.com/docs/components)
- [Shadcn/ui - Forms](https://ui.shadcn.com/docs/components/form)
- [Shadcn/ui - Dialog](https://ui.shadcn.com/docs/components/dialog)
- [Shadcn/ui - Toast (Sonner)](https://ui.shadcn.com/docs/components/sonner)
- [Radix UI - Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS - Core Concepts](https://tailwindcss.com/docs/utility-first)
- [date-fns - Format](https://date-fns.org/docs/format)
- [Lucide React - Icons](https://lucide.dev/)

---

## Component Library: Shadcn/ui

[Source: Shadcn/ui - Introduction](https://ui.shadcn.com/docs)

> "Beautifully designed components that you can copy and paste into your apps."

**Why Shadcn/ui?**
- **Copy-paste, not dependency** - components live in your codebase
- **Fully customizable** - own the code, modify freely
- **Accessible** - built on Radix UI primitives
- **Tailwind-styled** - matches the project's design system
- **TypeScript-first** - works with JSX too

**Component location**: `src/components/ui/`

---

## Icons: Lucide React

[Source: Lucide React](https://lucide.dev/)

```jsx
import { Plus, Trash2, Pencil, Info, Search } from "lucide-react";

<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>
```

**Rules:**
- Only Lucide icons (no FontAwesome, Material Icons, etc.)
- Import individually for tree-shaking
- Always set `size` or use Tailwind classes (`h-4 w-4`)
- Use semantic names: `Plus` for add, `Pencil` for edit, `Trash2` for delete, `Info` for info

---

## Buttons

[Source: Shadcn/ui - Button](https://ui.shadcn.com/docs/components/button)

### Variants

| Variant | Use | Style |
|---------|-----|-------|
| `default` | Primary action | Solid bg |
| `gradient` | Submit form | Gradient bg |
| `outline` | Secondary/cancel | Border only |
| `ghost` | Tertiary/icon | No bg |
| `destructive` | Delete/danger | Red bg |
| `link` | Inline link | Text only |

### Sizes

| Size | Dimensions | Use |
|------|-----------|-----|
| `default` | h-10 px-4 | Standard |
| `sm` | h-9 px-3 | Compact |
| `xs` | h-8 px-2 | Inline actions |
| `lg` | h-11 px-8 | Hero CTA |
| `icon` | h-10 w-10 | Icon only |

### Button Patterns

```jsx
// Add button (top-right, with icon)
<Button className="ml-auto" onClick={handleAdd}>
  <Plus className="mr-2 h-4 w-4" />
  Add Category
</Button>

// Submit (gradient)
<Button type="submit" variant="gradient" disabled={isPending}>
  {isPending ? 'Saving...' : 'Submit'}
</Button>

// Cancel (outline)
<Button type="button" variant="outline" onClick={onClose}>
  Cancel
</Button>

// Delete (destructive)
<Button variant="destructive" onClick={handleDelete}>
  <Trash2 className="mr-2 h-4 w-4" />
  Delete
</Button>

// Icon-only (table actions)
<Button size="icon" variant="ghost" onClick={() => handleEdit(row)}>
  <Pencil className="h-4 w-4" />
</Button>
```

**Reference: `frontend/src/components/Menu/Categories/CategoriesIndex.jsx:159-165`**

```jsx
<Button onClick={() => handleOpenModal({ isOpen: true, isEdit: false, data: null })} 
        size='sm' 
        className='text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500'>
  <div className='flex items-center gap-1'>
    <Plus size={18} />
    <span className='text-sm'>Add Category</span>
  </div>
</Button>
```

---

## Status Display (Borderless Chip)

```jsx
import { Chip } from "@/components/ui/chip";

<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
  ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
  {status}
</span>
```

**Reference: `frontend/src/components/Menu/Categories/CategoriesIndex.jsx:78-84`**

```jsx
cell: ({ cell }) => (
  cell?.getValue() === 1 ? (
    <Chip className='gap-1' variant='light' color='green' radius='md' size='sm' border='none'>
      <span>Active</span>
    </Chip>
  ) : (
    <Chip className='gap-1' variant='light' color='red' radius='md' size='sm' border='none'>
      <span>Inactive</span>
    </Chip>
  )
),
```

**Rules:**
- Borderless (no border)
- Soft background color
- Small rounded pill shape
- Status colors: green (success), red (error), yellow (warning), gray (neutral), blue (info)

---

## Priority Display (Icon + Text)

```jsx
<span className="flex items-center gap-1">
  <ArrowUp className="h-3 w-3 text-red-500" />
  High
</span>
```

**Rules:**
- Icon first, then text
- Icon size: `h-3 w-3` or `h-4 w-4`
- Color matches priority level

---

## Dialogs (Modals)

[Source: Shadcn/ui - Dialog](https://ui.shadcn.com/docs/components/dialog)

### Basic Dialog

```jsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={onClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Category</DialogTitle>
      <DialogDescription>
        Make changes to the category here.
      </DialogDescription>
    </DialogHeader>
    
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* form fields */}
        
        <DialogFooter>
          <Button type="submit" variant="gradient" disabled={isPending}>
            Save changes
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

**Rules:**
- Use `Dialog` for short interactions
- Use `Sheet` (drawer) for long content
- One primary action (Submit) + one secondary (Cancel)
- Close on ESC, backdrop click, or Cancel button
- Reset form on close

### Confirmation Dialog

```jsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

<AlertDialog open={open} onOpenChange={onClose}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Category?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete the category and all its menu items.
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete} className="bg-red-600">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Tabs

[Source: Shadcn/ui - Tabs](https://ui.shadcn.com/docs/components/tabs)

```jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
    <TabsTrigger value="settings*">Settings (In Progress)</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <OverviewPanel />
  </TabsContent>
  <TabsContent value="settings">
    <SettingsPanel />
  </TabsContent>
</Tabs>
```

**Rules:**
- Show `*` mark on tabs with incomplete features
- Use `value` + `onValueChange` for controlled tabs
- Use `defaultValue` for uncontrolled

**Reference: Project uses `<TabsContent value="...">` inside routes** (`MenuRoutes.jsx:16-24`)

---

## Toasts

[Source: react-toastify](https://fkhadra.github.io/react-toastify/)

**Reference: `frontend/src/utils/toast-utils.js`**

```javascript
import { toastSuccess, toastError } from "@/utils/toast-utils";

// Success
toastSuccess(res?.message || "Category created successfully");

// Error (show exact API message)
toastError(error?.err?.message || "Failed to create category");

// Warning
toastWarning("This action is irreversible");

// Info
toastInfo("New version available");
```

**Rules:**
- Use centralized toast utility, not direct `toast()` import
- Success on add/edit
- Error with exact API message (fallback generic message)
- Position: top-right (default) or top-center
- Auto-close: 2-3 seconds
- Limit: 3 toasts max

### Toast Container Setup

**Reference: `frontend/src/App.jsx:88-96`**

```jsx
<ToastContainer limit={3} />

<Toaster
  position="top-center"
  expand={true}
  toastOptions={{
    className: 'list-none'
  }}
/>
```

---

## Loaders

[Source: Shadcn/ui - Skeleton](https://ui.shadcn.com/docs/components/skeleton)

### Skeleton (for content)

```jsx
import { Skeleton } from "@/components/ui/skeleton";

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
```

### Bouncing Dots (for analytics cards)

```jsx
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
  );
}
```

### Spinner (for buttons/actions)

```jsx
import { Loader2 } from "lucide-react";

<Button disabled={isPending}>
  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isPending ? 'Saving...' : 'Save'}
</Button>
```

**Reference: Project uses `GoogleStyleLoader`, `PilsatingDotesLoader`, `SlackLoader`**

**Rules:**
- Use `Skeleton` for content loading
- Use bouncing dots for analytics/metrics
- Use spinner for button actions
- **Never use Slack loader** (project rule)

---

## Dates

[Source: date-fns - Format](https://date-fns.org/docs/format)

### Format Patterns

| Type | Format | Example |
|------|--------|---------|
| Date only | `EEE, dd-MM-yyyy` | `Mon, 14-04-2025` |
| Date + time | `dd-MM-yyyy hh:mm:ss a` | `14-04-2025 03:45:21 PM` |
| Time only | `hh:mm a` | `03:45 PM` |

### Utility Functions

```javascript
// utils/date.utils.js
import { format } from "date-fns";

export const formatDate = (date) =>
  date ? format(new Date(date), 'EEE, dd-MM-yyyy') : '—';

export const formatDateTime = (date) =>
  date ? format(new Date(date), 'dd-MM-yyyy hh:mm:ss a')
        .replace('am', 'AM').replace('pm', 'PM') : '—';

export const formatTime = (date) =>
  date ? format(new Date(date), 'hh:mm a') : '—';
```

**Rules:**
- Use `date-fns`, NEVER `moment.js`
- Put formats in `utils/date.utils.js`, don't inline
- Use `—` for null/undefined values
- Format date-only columns as `EEE, dd-MM-yyyy`
- Format datetime columns as `dd-MM-yyyy hh:mm:ss a`

---

## Side Panel (Drawer)

[Source: Shadcn/ui - Sheet](https://ui.shadcn.com/docs/components/sheet)

```jsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

<Sheet open={open} onOpenChange={onClose}>
  <SheetContent side="right" className="w-[400px]">
    <SheetHeader>
      <SheetTitle>Category Details</SheetTitle>
      <SheetDescription>
        View complete category information.
      </SheetDescription>
    </SheetHeader>
    
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <p>{category.name}</p>
      </div>
      <div>
        <label className="text-sm font-medium">Status</label>
        <Chip>{category.status === 1 ? 'Active' : 'Inactive'}</Chip>
      </div>
    </div>
  </SheetContent>
</Sheet>
```

**Reference: Project uses `RowDetailsModal` for info panels**

---

## Dropdown Menu

[Source: Shadcn/ui - Dropdown Menu](https://ui.shadcn.com/docs/components/dropdown-menu)

```jsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuItem onClick={() => handleEdit(row)}>
      <Pencil className="mr-2 h-4 w-4" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => handleDelete(row)}>
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => handleView(row)}>
      <Info className="mr-2 h-4 w-4" />
      View Details
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Select

[Source: Shadcn/ui - Select](https://ui.shadcn.com/docs/components/select)

```jsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

<Select onValueChange={field.onChange} value={field.value}>
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Active</SelectItem>
    <SelectItem value="0">Inactive</SelectItem>
  </SelectContent>
</Select>
```

**Rules:**
- Never use native `<select>` (Shadcn `Select` only)
- Always include `SelectValue` with `placeholder`
- Use `ScrollArea` if more than 10 options

---

## Combobox

[Source: Shadcn/ui - Combobox](https://ui.shadcn.com/docs/components/combobox)

```jsx
import { Combobox } from "@/components/ui/combobox";

<Combobox
  options={[
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
  ]}
  value={field.value}
  onChange={field.onChange}
  placeholder="Select option..."
  searchPlaceholder="Search options..."
  emptyMessage="No option found."
/>
```

**When to use:**
- More than 10 options (searchable)
- Multi-select
- Async options (search API)

---

## Card

[Source: Shadcn/ui - Card](https://ui.shadcn.com/docs/components/card)

```jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

## Empty State

[Source: Shadcn/ui - Empty](https://ui.shadcn.com/docs/components/empty)

```jsx
import { Inbox } from "lucide-react";

function EmptyState({ message = "No data found" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
```

**Project rule**: Show "Table not found" (not "No data") when empty.

---

## Under Development

```jsx
import { Construction } from "lucide-react";

function UnderDevelopment() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Construction className="h-10 w-10 mb-3 text-yellow-500" />
      <p className="text-sm font-medium">Under Development</p>
    </div>
  );
}

// Tabs with incomplete features show *:
// <TabsTrigger value="settings">Settings *</TabsTrigger>
```

---

## Responsive Design

[Source: Tailwind CSS - Responsive Design](https://tailwindcss.com/docs/responsive-design)

```jsx
<div className="
  flex flex-col           // mobile: stack
  md:flex-row             // tablet+: side by side
  gap-2 md:gap-4          // responsive gap
  p-2 md:p-4              // responsive padding
">
  <div className="w-full md:w-1/2">Column 1</div>
  <div className="w-full md:w-1/2">Column 2</div>
</div>
```

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Rules:**
- Mobile-first (default styles, then `md:`, `lg:` overrides)
- Test on mobile, tablet, desktop
- Tables: horizontal scroll on mobile
- Forms: stack on mobile, side-by-side on desktop

---

## Accessibility (a11y)

[Source: Radix UI - Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)

### Rules

1. **Use semantic HTML** - `<button>`, `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`
2. **Labels on all inputs** - never placeholder-only
3. **ARIA attributes** when needed - `aria-label`, `aria-describedby`
4. **Keyboard navigation** - Tab, Enter, Escape, Arrow keys
5. **Focus management** - visible focus ring, trap focus in modals
6. **Color contrast** - WCAG AA minimum (4.5:1)
7. **Alt text on images** - describe content, not "image of"

```jsx
// Good
<Button aria-label="Delete category" onClick={handleDelete}>
  <Trash2 className="h-4 w-4" />
</Button>

// Good
<label htmlFor="name">Name *</label>
<input id="name" {...register("name")} />

// Good
<nav aria-label="Main navigation">...</nav>
```

---

## Best Practice Checklist

- [ ] Use Lucide icons (never other icon sets)
- [ ] Use Shadcn components throughout
- [ ] Use `date-fns` for all date formatting
- [ ] Use react-toastify via `toast-utils.js` wrapper
- [ ] Show loading state for all async operations
- [ ] Show empty state ("Table not found") when no data
- [ ] Show error state with retry
- [ ] Action button order: Edit → Delete → Info
- [ ] Status as borderless chip
- [ ] Single form for create and edit
- [ ] Modal state as single object: `{ open, mode, data }`
- [ ] Required fields marked with `*`
- [ ] Accessible labels and ARIA
- [ ] Keyboard navigation works
- [ ] Responsive on mobile/tablet/desktop
- [ ] No inline styles (use Tailwind)
- [ ] No raw HTML colors (use theme tokens)
- [ ] No inline event handlers > 3 lines (extract to function)
- [ ] No emoji in UI (unless requested)
- [ ] Comments only when needed (JSDoc for non-obvious)
