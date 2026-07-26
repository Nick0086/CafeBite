import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { Info, Pencil } from 'lucide-react';

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

export const getCategoryColumns = ({ onView, onEdit }) => [
    {
        header: 'Sr No',
        accessorKey: 'id',
        colClassName: 'w-2/12 text-start',
        cell: ({ row }) => row.index + 1,
    },
    {
        header: 'Category',
        accessorKey: 'name',
        colClassName: 'w-4/12 text-start',
    },
    {
        header: 'Count',
        accessorKey: 'menu_item_count',
        HeaderClassName: 'text-center',
        colClassName: 'w-2/12',
    },
    {
        header: 'Status',
        accessorKey: 'status',
        HeaderClassName: 'text-center',
        colClassName: 'w-2/12',
        cell: ({ cell }) => <StatusCell value={cell.getValue()} />,
        filterFn: (row, id, value) => value?.includes(row?.getValue(id)),
    },
    {
        id: 'actions',
        header: 'Actions',
        HeaderClassName: 'text-center',
        colClassName: 'w-2/12 text-center',
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
