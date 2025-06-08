import { X } from 'lucide-react';
import { getStatusOptions } from '../utils';
import { DataTableFacetedFilter } from '@/common/Table/data-table-faceted-filter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from '../../../../common/Table/data-table-view-options';
import { useTranslation } from 'react-i18next';

const CommonTableToolbar = ({
    table,
    columnsMapping,
    searchColumnId,
    searchPlaceholder,
}) => {
    const {t} = useTranslation();
    const isFiltered = table.getState().columnFilters.length > 0;

    const statusOptions = getStatusOptions(t);

    return (
        <div className="flex lg:flex-row flex-col lg::items-center justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
                <Input
                    placeholder={searchPlaceholder || `Filter...`}
                    value={table.getColumn(searchColumnId)?.getFilterValue() ?? ""}
                    onChange={(event) =>
                        table.getColumn(searchColumnId)?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-full sm:w-[250px] lg:w-[250px]"
                />
                <div>
                    {table.getColumn("status") && (
                        <DataTableFacetedFilter
                            column={table.getColumn("status")}
                            title={t('status')}
                            options={statusOptions}
                        />
                    )}
                </div>


                {isFiltered && (
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                table.resetColumnFilters();
                            }}
                            className="text-red-500 h-8 px-1 lg:px-2 hover:bg-red-100 hover:text-red-700"
                        >
                            {t('reset')}
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
            {/* <DataTableViewOptions table={table} headers={columnsMapping} /> */}
        </div>
    )
}

export default CommonTableToolbar