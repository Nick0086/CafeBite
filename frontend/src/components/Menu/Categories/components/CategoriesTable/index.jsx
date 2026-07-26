import { useMemo, useState } from 'react';
import {
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Card } from '@/components/ui/card';
import GoogleStyleLoader from '@/components/ui/loaders/GoogleStyleLoader';
import { CommonTable } from '@/common/Table/CommonTable';
import { CommonTableToolbar } from '@/common/Table/CommonTableToolbar';
import { CATEGORY_COLUMNS_MAPPING, CATEGORY_STATUS_OPTIONS } from '../../constants/category.constants';
import { getCategoryColumns } from './CategoriesColumns';

export default function CategoriesTable({ data, isLoading, onView, onEdit }) {
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([{ id: 'status', value: [1] }]);
    const [columnVisibility, setColumnVisibility] = useState({});

    const columns = useMemo(() => getCategoryColumns({ onView, onEdit }), [onView, onEdit]);

    const tableInstance = useReactTable({
        columns,
        data: data?.categories || [],
        state: { sorting, columnFilters, columnVisibility },
        initialState: { pagination: { pageSize: 100 } },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
    });

    if (isLoading) {
        return (
            <Card className="h-screen w-full transition ease-in-out duration-300">
                <GoogleStyleLoader className="h-[70%]" />
            </Card>
        );
    }

    return (
        <div>
            <div className="border-y border-gray-200 p-2">
                <CommonTableToolbar
                    table={tableInstance}
                    columnsMapping={CATEGORY_COLUMNS_MAPPING}
                    searchColumnId="name"
                    searchPlaceholder="Filter by Category..."
                    statusOptions={CATEGORY_STATUS_OPTIONS}
                />
            </div>
            <div className="border-y border-gray-200">
                <CommonTable
                    table={tableInstance}
                    tableStyle="2xl:h-[69dvh] h-[60dvh]"
                    tableHeadRowStyle="bg-indigo-50/20 hover:bg-indigo-50/50"
                    tableBodyRowStyle="text-center bg-transparent hover:bg-indigo-50/50"
                />
            </div>
        </div>
    );
}
