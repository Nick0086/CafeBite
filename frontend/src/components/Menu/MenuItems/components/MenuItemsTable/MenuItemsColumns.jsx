import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { Info, Pencil } from 'lucide-react';

const FoodTypeCell = ({ value }) =>
    value === 'veg' ? (
        <Chip className="gap-1" variant="light" color="green" radius="md" size="sm" border="none">
            <span>Veg</span>
        </Chip>
    ) : (
        <Chip className="gap-1" variant="light" color="red" radius="md" size="sm" border="none">
            <span>Non Veg</span>
        </Chip>
    );

const AvailabilityCell = ({ value }) =>
    value === 'in_stock' ? (
        <Chip className="gap-1" variant="light" color="green" radius="md" size="sm" border="none">
            <span>Available</span>
        </Chip>
    ) : (
        <Chip className="gap-1" variant="light" color="red" radius="md" size="sm" border="none">
            <span>Out Of Stock</span>
        </Chip>
    );

const StatusCell = ({ value }) =>
    value === 1 ? (
        <Chip className="gap-1" variant="light" color="green" radius="md" size="sm" border="none">
            <span>Active</span>
        </Chip>
    ) : (
        <Chip className="gap-1" variant="light" color="red" radius="md" size="sm" border="none">
            <span>Inactive</span>
        </Chip>
    );

export const getMenuItemColumns = ({ onView, onEdit, currencySymbol }) => [
    {
        header: 'Sr No',
        accessorKey: 'id',
        colClassName: 'w-1/12',
        cell: ({ row }) => row.index + 1,
    },
    {
        header: 'Item Name',
        accessorKey: 'name',
        colClassName: 'w-3/12',
    },
    {
        header: 'Price',
        accessorKey: 'price',
        colClassName: 'w-1/12',
        cell: ({ cell }) => (
            <div className="flex items-center gap-0.5">
                <span>{currencySymbol}</span>
                <span>{cell?.getValue()}</span>
            </div>
        ),
        filterFn: (row, id, filterValue) => {
            if (!filterValue) return true;
            try {
                const { value, operator } = JSON.parse(filterValue);
                const rowValue = parseFloat(row.getValue(id));
                switch (operator) {
                    case 'lessThan':
                        return rowValue < value;
                    case 'greaterThan':
                        return rowValue > value;
                    case 'equals':
                    default:
                        return rowValue === value;
                }
            } catch {
                return true;
            }
        },
    },
    {
        header: 'Category',
        accessorKey: 'category_name',
        colClassName: 'w-2/12',
        filterFn: (row, id, value) => value?.includes(row?.getValue(id)),
    },
    {
        header: 'Food Type',
        accessorKey: 'veg_status',
        HeaderClassName: 'text-center',
        colClassName: 'w-1/12 text-center',
        cell: ({ cell }) => <FoodTypeCell value={cell.getValue()} />,
        filterFn: (row, id, value) => value?.includes(row?.getValue(id)),
    },
    {
        header: 'Availability',
        accessorKey: 'availability',
        HeaderClassName: 'text-center',
        colClassName: 'w-1/12 text-center',
        cell: ({ cell }) => <AvailabilityCell value={cell.getValue()} />,
        filterFn: (row, id, value) => value?.includes(row?.getValue(id)),
    },
    {
        header: 'Status',
        accessorKey: 'status',
        HeaderClassName: 'text-center',
        colClassName: 'w-1/12 text-center',
        cell: ({ cell }) => <StatusCell value={cell.getValue()} />,
        filterFn: (row, id, value) => value?.includes(row?.getValue(id)),
    },
    {
        id: 'actions',
        header: 'Actions',
        HeaderClassName: 'text-center',
        colClassName: 'w-1/12 text-center',
        cell: ({ row }) => (
            <div>
                <Button
                    size="xs"
                    type="button"
                    variant="ghost"
                    className="rounded-full text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600"
                    onClick={() => onView(row?.original)}
                >
                    <Info size={16} />
                </Button>
                <Button
                    size="xs"
                    type="button"
                    variant="ghost"
                    className="rounded-full text-green-500 hover:bg-green-100 hover:text-green-600"
                    onClick={() => onEdit(row?.original)}
                >
                    <Pencil size={16} />
                </Button>
            </div>
        ),
    },
];
