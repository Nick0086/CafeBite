import { Button } from '@/components/ui/button';
import { Info, Pencil } from 'lucide-react';

export const getTemplateColumns = ({ onView, onEdit }) => [
    {
        header: 'Sr No',
        accessorKey: 'id',
        colClassName: 'w-1/12',
    },
    {
        header: 'Templates Name',
        accessorKey: 'name',
        colClassName: 'w-4/12',
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
