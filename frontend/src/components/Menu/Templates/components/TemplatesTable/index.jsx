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
import { getTemplateColumns } from './TemplatesColumns';

export default function TemplatesTable({ data, isLoading, onView, onEdit }) {
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});

    const columns = useMemo(() => getTemplateColumns({ onView, onEdit }), [onView, onEdit]);

    const tableData = useMemo(() => data?.templates || [], [data]);

    const tableInstance = useReactTable({
        columns,
        data: tableData,
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
                    searchColumnId="name"
                    searchPlaceholder="Filter By Templates..."
                />
            </div>
            <div className="border-y border-gray-200">
                <CommonTable
                    table={tableInstance}
                    tableStyle="2xl:h-[69dvh] h-[60dvh]"
                    tableHeadRowStyle="bg-indigo-50/20 hover:bg-indigo-50/50"
                    tableBodyRowStyle="bg-transparent hover:bg-indigo-50/50"
                />
            </div>
        </div>
    );
}
