# Folder Structure Example — GsmModem Module

This is the canonical example. Every new module follows this exact pattern.

---

## Rule: When a Component Gets Its Own Sub-Folder

A component file becomes a **folder** when ANY of these are true:
- It has internal sub-components (e.g. table has column cell components)
- It exceeds ~150 lines and can be split into meaningful parts
- It imports or defines more than one logical piece (e.g. form has field groups, table has toolbar)

**Pattern:**
```
components/
└── GsmModemTable.jsx          ← simple, stays as file
```
becomes:
```
components/
└── GsmModemTable/
    ├── index.jsx              ← entry: assembles the table
    ├── GsmModemColumns.jsx    ← column definitions + cell renderers
    ├── GsmModemToolbar.jsx    ← top bar (search, bulk actions)
    └── GsmModemRowActions.jsx ← Edit / Delete / Info buttons per row
```

The parent always imports from the folder name — `import GsmModemTable from './components/GsmModemTable'` — unchanged. The index.jsx inside handles the rest.

---

## Full Folder Tree (with sub-folder expansion)

```
src/pages/GsmModem/
├── index.jsx                              ← Page entry: orchestrates everything
│
├── components/
│   │
│   ├── GsmModemTable/                     ← TABLE: big → gets own folder
│   │   ├── index.jsx                      ← assembles table, handles states
│   │   ├── GsmModemColumns.jsx            ← column defs + all cell renderers
│   │   ├── GsmModemRowActions.jsx         ← Edit → Delete → Info button group
│   │   └── GsmModemTableToolbar.jsx       ← bulk actions, row count, etc.
│   │
│   ├── GsmModemForm/                      ← FORM: big → gets own folder
│   │   ├── index.jsx                      ← Dialog wrapper, submit logic
│   │   ├── GsmModemFormFields.jsx         ← all field inputs (reused by create+edit)
│   │   └── GsmModemFormFooter.jsx         ← Submit / Cancel buttons
│   │
│   ├── GsmModemFilterDisplay/             ← FILTER: if complex → folder
│   │   ├── index.jsx                      ← filter row wrapper
│   │   ├── GsmModemSearchInput.jsx        ← search input field
│   │   └── GsmModemStatusFilter.jsx       ← status select filter
│   │
│   ├── GsmModemFilterModal/               ← SERVER-SIDE FILTER MODAL
│   │   ├── index.jsx                      ← modal shell
│   │   └── GsmModemFilterForm.jsx         ← filter fields inside modal
│   │
│   ├── GsmModemDeleteDialog.jsx           ← simple enough → stays as file
│   └── GsmModemInfoPanel.jsx              ← simple enough → stays as file
│
├── hooks/
│   ├── useGsmModem.js                     ← react-query: list, create, update, delete
│   ├── useGsmModemForm.js                 ← react-hook-form + zod resolver
│   └── useGsmModemFilter.js               ← filter state + nuqs URL sync
│
├── constants/
│   └── gsmModem.constants.js              ← status options, enum labels, defaults
│
└── validation/
    └── gsmModem.schema.js                 ← Zod schemas: create, update, filter
```

---

## Component Sub-Folder index.jsx Pattern

Every component folder's `index.jsx` is the **only** public interface.
Parent never imports from deep inside — only from the folder name.

### GsmModemTable/index.jsx
```jsx
// components/GsmModemTable/index.jsx
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { showToast } from '@/utils/toast'
import { buildGsmModemColumns } from './GsmModemColumns'
import GsmModemTableToolbar from './GsmModemTableToolbar'

export default function GsmModemTable({ data, isLoading, isError, error, onEdit, onDelete, onInfo }) {

  const columns = buildGsmModemColumns({ onEdit, onDelete, onInfo })

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) return <TableSkeleton rows={5} cols={6} />

  if (isError) {
    showToast.error(error?.response?.data?.message || 'Failed to load devices')
    return null
  }

  if (!data?.length) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Table not found
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <GsmModemTableToolbar table={table} />
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b bg-muted/50">
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-4 py-2 text-center font-medium">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### GsmModemColumns.jsx
```jsx
// components/GsmModemTable/GsmModemColumns.jsx
import { formatDate, formatDateTime } from '@/utils/date.utils'
import { StatusChip } from '@/components/ui/StatusChip'
import GsmModemRowActions from './GsmModemRowActions'

// Call this function to get columns — pass action handlers in
export function buildGsmModemColumns({ onEdit, onDelete, onInfo }) {
  return [
    {
      accessorKey: 'deviceId',
      header: 'Device ID',
      cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    },
    {
      accessorKey: 'simNumber',
      header: 'SIM Number',
      cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    },
    {
      accessorKey: 'imei',
      header: 'IMEI',
      cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <div className="flex justify-center">
          <StatusChip status={getValue()} />
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }) => (
        <div className="text-center">{formatDate(getValue())}</div>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ getValue }) => (
        <div className="text-center">{formatDateTime(getValue())}</div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <GsmModemRowActions
          row={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
          onInfo={onInfo}
        />
      ),
    },
  ]
}
```

### GsmModemRowActions.jsx
```jsx
// components/GsmModemTable/GsmModemRowActions.jsx
// Action button order is ALWAYS: Edit → Delete → Info
import { Pencil, Trash2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GsmModemRowActions({ row, onEdit, onDelete, onInfo }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button size="icon" variant="ghost" onClick={() => onEdit(row)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" onClick={() => onDelete(row)}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
      <Button size="icon" variant="ghost" onClick={() => onInfo(row)}>
        <Info className="h-4 w-4 text-blue-500" />
      </Button>
    </div>
  )
}
```

### GsmModemTableToolbar.jsx
```jsx
// components/GsmModemTable/GsmModemTableToolbar.jsx
export default function GsmModemTableToolbar({ table }) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
      <span>{table.getRowModel().rows.length} records</span>
      {/* Add bulk actions here if needed */}
    </div>
  )
}
```

---

### GsmModemForm/index.jsx
```jsx
// components/GsmModemForm/index.jsx
import { useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGsmModemForm } from '../../hooks/useGsmModemForm'
import { useGsmModem } from '../../hooks/useGsmModem'
import GsmModemFormFields from './GsmModemFormFields'
import GsmModemFormFooter from './GsmModemFormFooter'

export default function GsmModemForm({ open, mode, defaultValues, onClose }) {
  const isEdit = mode === 'edit'
  const form = useGsmModemForm(defaultValues)
  const { create, update } = useGsmModem()

  useEffect(() => {
    if (open) form.reset(defaultValues ?? {})
  }, [open, defaultValues])

  const onSubmit = form.handleSubmit((values) => {
    const mutation = isEdit
      ? update.mutate({ id: defaultValues.id, ...values }, { onSuccess: onClose })
      : create.mutate(values, { onSuccess: onClose })
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Device' : 'Add Device'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* All fields in single column */}
          <GsmModemFormFields form={form} />
          <GsmModemFormFooter
            onClose={onClose}
            isLoading={create.isLoading || update.isLoading}
            isEdit={isEdit}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### GsmModemFormFields.jsx
```jsx
// components/GsmModemForm/GsmModemFormFields.jsx
// Single column layout — every Create/Update form uses column
import { Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Select from 'react-select'
import { GSM_STATUS_OPTIONS } from '../../constants/gsmModem.constants'

export default function GsmModemFormFields({ form }) {
  const { register, control, formState: { errors } } = form

  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="deviceId">
          Device ID <span className="text-red-500">*</span>
        </Label>
        <Input id="deviceId" {...register('deviceId')} />
        {errors.deviceId && <p className="text-xs text-red-500">{errors.deviceId.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="simNumber">
          SIM Number <span className="text-red-500">*</span>
        </Label>
        <Input id="simNumber" {...register('simNumber')} />
        {errors.simNumber && <p className="text-xs text-red-500">{errors.simNumber.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="imei">
          IMEI <span className="text-red-500">*</span>
        </Label>
        <Input id="imei" {...register('imei')} />
        {errors.imei && <p className="text-xs text-red-500">{errors.imei.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Status <span className="text-red-500">*</span></Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              options={GSM_STATUS_OPTIONS}
              value={GSM_STATUS_OPTIONS.find(o => o.value === field.value) ?? null}
              onChange={(opt) => field.onChange(opt?.value)}
              placeholder="Select status"
            />
          )}
        />
        {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
      </div>
    </>
  )
}
```

### GsmModemFormFooter.jsx
```jsx
// components/GsmModemForm/GsmModemFormFooter.jsx
import { DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function GsmModemFormFooter({ onClose, isLoading, isEdit }) {
  return (
    <DialogFooter className="gap-2 pt-2">
      {/* Cancel — outline variant */}
      <Button type="button" variant="outline" onClick={onClose}>
        Cancel
      </Button>
      {/* Submit — gradient variant */}
      <Button
        type="submit"
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
        disabled={isLoading}
      >
        {isEdit ? 'Update' : 'Add'}
      </Button>
    </DialogFooter>
  )
}
```

---

### GsmModemFilterDisplay/index.jsx
```jsx
// components/GsmModemFilterDisplay/index.jsx
import GsmModemSearchInput from './GsmModemSearchInput'
import GsmModemStatusFilter from './GsmModemStatusFilter'
import { Button } from '@/components/ui/button'

export default function GsmModemFilterDisplay({ filter, onFilterChange, onClear }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <GsmModemSearchInput
        value={filter.search}
        onChange={(val) => onFilterChange({ ...filter, search: val })}
      />
      <GsmModemStatusFilter
        value={filter.status}
        onChange={(val) => onFilterChange({ ...filter, status: val })}
      />
      {/* Clear — secondary variant */}
      <Button variant="secondary" size="sm" onClick={onClear}>
        Clear
      </Button>
    </div>
  )
}
```

### GsmModemSearchInput.jsx
```jsx
// components/GsmModemFilterDisplay/GsmModemSearchInput.jsx
import { Input } from '@/components/ui/input'

export default function GsmModemSearchInput({ value, onChange }) {
  return (
    <Input
      placeholder="Search device ID, SIM..."
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="max-w-xs"
    />
  )
}
```

### GsmModemStatusFilter.jsx
```jsx
// components/GsmModemFilterDisplay/GsmModemStatusFilter.jsx
import Select from 'react-select'
import { GSM_STATUS_OPTIONS } from '../../constants/gsmModem.constants'

export default function GsmModemStatusFilter({ value, onChange }) {
  return (
    <Select
      options={GSM_STATUS_OPTIONS}
      value={GSM_STATUS_OPTIONS.find(o => o.value === value) ?? null}
      onChange={(opt) => onChange(opt?.value ?? '')}
      placeholder="Status"
      isClearable
      className="min-w-[140px]"
    />
  )
}
```

---

## Decision Tree — File or Folder?

```
Is the component > ~150 lines?
    YES → make it a folder with index.jsx
    NO  → does it define internal sub-components or major UI sections?
              YES → folder
              NO  → single file is fine
```

### Always folder (regardless of size):
- `<Module>Table/`       — always has columns + row actions as separate files
- `<Module>Form/`        — always splits fields + footer
- `<Module>FilterModal/` — always has modal shell + filter fields

### Usually stays as file:
- `<Module>DeleteDialog.jsx`  — focused, small
- `<Module>InfoPanel.jsx`     — unless it has tabs (then folder)
- `<Module>FilterDisplay.jsx` — folder only if filter has 3+ distinct filter inputs