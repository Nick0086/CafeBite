import { useContext, useEffect, useMemo, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { RowDetailsModal } from '@/common/Modal/RowDetailsModal';
import { DataTablePagination } from '@/components/ui/table-pagination';
import { CommonTable } from '@/common/Table/CommonTable';
import { CommonTableToolbar } from '@/common/Table/CommonTableToolbar';
import GoogleStyleLoader from '@/components/ui/loaders/GoogleStyleLoader';
import { PermissionsContext } from '@/contexts/PermissionsContext';
import {
    MENU_ITEM_FOOD_OPTIONS,
    MENU_ITEM_STATUS_OPTIONS,
    MENU_ITEM_STOCK_OPTIONS,
    PRICE_OPERATORS,
} from '../../constants/menuItem.constants';
import { getMenuItemColumns } from './MenuItemsColumns';

const PriceFilter = ({ table }) => {
    const [value, setValue] = useState('');
    const [operator, setOperator] = useState('equals');

    const apply = (nextValue, nextOperator) => {
        const col = table.getColumn('price');
        if (!col) return;
        if (nextValue && parseFloat(nextValue) > 0) {
            col.setFilterValue(
                JSON.stringify({ value: parseFloat(nextValue), operator: nextOperator })
            );
        } else {
            col.setFilterValue(undefined);
        }
    };

    useEffect(() => {
        if (value) apply(value, operator);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [operator]);

    const reset = () => {
        setValue('');
        table.getColumn('price')?.setFilterValue(undefined);
    };

    if (!table.getColumn('price')) return null;

    return (
        <div className="flex items-center space-x-2 bg-white border rounded-md p-1 px-2 border-input">
            <span className="text-sm font-medium">Price:</span>
            <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger className="h-6 border-none px-0 focus:ring-0">
                    <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                    {PRICE_OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                            {op.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Separator orientation="vertical" className="h-6" />
            <Input
                type="number"
                placeholder="Price..."
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    apply(e.target.value, operator);
                }}
                className="h-6 border-none shadow-none w-[75px] px-0.5 focus:border-none focus-visible:ring-0"
            />
            {value && (
                <Button
                    variant="ghost"
                    onClick={reset}
                    className="text-red-500 h-6 px-1 hover:bg-red-100 hover:text-red-700"
                    size="sm"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
};

export default function MenuItemsTable({ data, isLoading, categoryOptions, categoryIsLoading, onEdit }) {
    const { permissions } = useContext(PermissionsContext);
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([{ id: 'status', value: [1] }]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [selectedRow, setSelectedRow] = useState(null);

    const columns = useMemo(
        () =>
            getMenuItemColumns({
                onView: (row) => setSelectedRow(row),
                onEdit,
                currencySymbol: permissions?.currency_symbol,
            }),
        [onEdit, permissions]
    );

    const extraFilters = useMemo(
        () => [
            { columnId: 'veg_status', title: 'Food Type', options: MENU_ITEM_FOOD_OPTIONS },
            { columnId: 'category_name', title: 'Category', options: categoryOptions, requireColumn: true, hideIfLoading: categoryIsLoading },
            { columnId: 'availability', title: 'Availability', options: MENU_ITEM_STOCK_OPTIONS },
        ],
        [categoryOptions, categoryIsLoading]
    );

    const tableData = useMemo(() => data?.menuItems || [], [data]);

    const tableInstance = useReactTable({
        columns,
        data: tableData,
        state: { sorting, columnFilters, columnVisibility },
        initialState: { pagination: { pageSize: 50 } },
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
        <>
            <RowDetailsModal
                isOpen={selectedRow !== null}
                onClose={() => setSelectedRow(null)}
                data={selectedRow || {}}
                title="Menu Item Details"
            />
            <div className="border-y border-gray-200 p-2">
                <CommonTableToolbar
                    table={tableInstance}
                    searchColumnId="name"
                    searchPlaceholder="Filter By Menu..."
                    statusOptions={MENU_ITEM_STATUS_OPTIONS}
                    extraFilters={extraFilters}
                    customFilters={<PriceFilter table={tableInstance} />}
                />
            </div>
            <div>
                <CommonTable
                    table={tableInstance}
                    tableStyle="2xl:h-[69dvh] h-[60dvh]"
                    tableHeadRowStyle="bg-indigo-50/20 hover:bg-indigo-50/50"
                    tableBodyRowStyle="bg-transparent hover:bg-indigo-50/50"
                />
            </div>
            <div className="mt-2 pt-2 border-t">
                <DataTablePagination table={tableInstance} count={data?.menuItems?.length || 0} />
            </div>
        </>
    );
}
