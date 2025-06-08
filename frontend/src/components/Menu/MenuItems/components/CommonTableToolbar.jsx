import { DataTableFacetedFilter } from '@/common/Table/data-table-faceted-filter';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import {  getFoodOptions, getStatusOptions, getStockOptions } from '../utils';
import { DataTableViewOptions } from '@/common/Table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';

export default function CommonTableToolbar({
    table,
    columnsMapping,
    searchColumnId,
    searchPlaceholder,
    categoryIsLoading,
    categoryOptions
}) {

    const {t} = useTranslation();
    const isFiltered = table.getState().columnFilters.length > 0;
    const [priceValue, setPriceValue] = useState("");
    const [priceOperator, setPriceOperator] = useState("equals");

    // Function to handle price filter
    const handlePriceFilter = (Value) => {
        if (Value && table.getColumn("price")) {
            const filterValue = {
                value: parseFloat(Value),
                operator: priceOperator
            };

            // Apply the filter as a string value that we'll parse in the column definition
            table.getColumn("price").setFilterValue(JSON.stringify(filterValue));
        } else {
            resetPriceFilter()
        }
    }

    useEffect(() => {
        if (priceValue > 0) {
            handlePriceFilter(priceValue)
        }
    }, [priceOperator])

    // Reset price filter function
    const resetPriceFilter = () => {
        setPriceValue("");
        if (table.getColumn("price")) {
            table.getColumn("price").setFilterValue(undefined);
        }
    }

    return (
        <div className="flex flex-col gap-2 ">
            <div className="flex flex-1 items-start space-x-2 justify-between">
                <div className='flex flex-wrap items-center gap-2' >
                    <Input
                        placeholder={searchPlaceholder || t('filter_generic')}
                        value={table.getColumn(searchColumnId)?.getFilterValue() ?? ""}
                        onChange={(event) =>
                            table.getColumn(searchColumnId)?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-full sm:w-[150px] lg:w-[320px]"
                    />

                    {/* Price Filter */}
                    {table.getColumn("price") && (
                        <div className="flex items-center space-x-2 bg-white border rounded-md p-1 px-2 border-input">
                            <span className="text-sm font-medium">{t('price')}:</span>
                            <Select
                                className='focus:border-none focus:ring-0'
                                value={priceOperator}
                                onValueChange={setPriceOperator}
                            >
                                <SelectTrigger className="h-6  border-none px-0 focus:ring-0">
                                    <SelectValue placeholder={t('operator')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="equals">{t('equals')}</SelectItem>
                                    <SelectItem value="greaterThan">{t('greater_than')}</SelectItem>
                                    <SelectItem value="lessThan">{t('less_than')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Separator orientation='vertical' className='h-6' />
                            <Input
                                type="number"
                                placeholder={`${t('price')}...`}
                                value={priceValue}
                                onChange={(e) => {
                                    setPriceValue(e.target.value)
                                    handlePriceFilter(e.target.value)
                                }}
                                className="h-6 border-none shadow-none w-[75px] px-0.5 focus:border-none focus-visible:ring-0"
                            />
                            {priceValue && (
                                <Button
                                    variant="ghost"
                                    onClick={resetPriceFilter}
                                    className="text-red-500 h-6 px-1 hover:bg-red-100 hover:text-red-700"
                                    size="sm"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}

                    {table.getColumn("status") && (
                        <DataTableFacetedFilter
                            column={table.getColumn("status")}
                            title={t('status')}
                            options={getStatusOptions(t)}
                        />
                    )}

                    {table.getColumn("veg_status") && (
                        <DataTableFacetedFilter
                            column={table.getColumn("veg_status")}
                            title={t('food_type')}
                            options={getFoodOptions(t)}
                        />
                    )}

                    {(table.getColumn("category_name") && !categoryIsLoading) && (
                        <DataTableFacetedFilter
                            column={table.getColumn("category_name")}
                            title={t('category')}
                            options={categoryOptions}
                        />
                    )}

                    {table.getColumn("availability") && (
                        <DataTableFacetedFilter
                            column={table.getColumn("availability")}
                            title={t('availability')}
                            options={getStockOptions(t)}
                        />
                    )}

                    {isFiltered && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                table.resetColumnFilters();
                                resetPriceFilter()
                            }}
                            className="text-red-500 h-8 px-1 lg:px-2 hover:bg-red-100 hover:text-red-700"
                        >
                            {t('reset')}
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* <DataTableViewOptions table={table} headers={columnsMapping} /> */}
            </div>

        </div>
    )
}
