import { X } from 'lucide-react';
import { DataTableFacetedFilter } from '@/common/Table/DataTableFacetedFilter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function CommonTableToolbar({
    table,
    searchColumnId,
    searchPlaceholder,
    statusOptions,
    extraFilters = [],
    onResetCustomFilters,
}) {
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-1 items-start space-x-2 justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    {searchColumnId && (
                        <Input
                            placeholder={searchPlaceholder || 'Filter...'}
                            value={table.getColumn(searchColumnId)?.getFilterValue() ?? ''}
                            onChange={(event) =>
                                table.getColumn(searchColumnId)?.setFilterValue(event.target.value)
                            }
                            className="h-8 w-full sm:w-[150px] lg:w-[320px]"
                        />
                    )}

                    {statusOptions && table.getColumn('status') && (
                        <DataTableFacetedFilter
                            column={table.getColumn('status')}
                            title="Status"
                            options={statusOptions}
                        />
                    )}

                    {extraFilters.map((filter) => {
                        const column = filter.columnId ? table.getColumn(filter.columnId) : null;
                        if (filter.requireColumn && !column) return null;
                        return (
                            <DataTableFacetedFilter
                                key={filter.columnId || filter.title}
                                column={column}
                                title={filter.title}
                                options={filter.options}
                            />
                        );
                    })}

                    {isFiltered && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                table.resetColumnFilters();
                                onResetCustomFilters?.();
                            }}
                            className="text-red-500 h-8 px-1 lg:px-2 hover:bg-red-100 hover:text-red-700"
                        >
                            Reset
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
