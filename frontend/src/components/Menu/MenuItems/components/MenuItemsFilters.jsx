import { FacetedFilter } from '@/components/ui/FacetedFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import {
    MENU_ITEM_FOOD_OPTIONS,
    MENU_ITEM_STATUS_OPTIONS,
    MENU_ITEM_STOCK_OPTIONS,
} from '../constants/menuItem.constants';
import MenuItemsPriceFilter from './MenuItemsPriceFilter';

export default function MenuItemsFilters({
    search,
    setSearch,
    statuses,
    setStatuses,
    foodTypes,
    setFoodTypes,
    categories,
    setCategories,
    availability,
    setAvailability,
    price,
    setPrice,
    categoryOptions,
    hasAnyFilter,
    onReset,
}) {
    return (
        <div className="border-b border-slate-100 px-2 sm:px-3 py-3">
            <div className="flex flex-wrap gap-2 items-center">
                <Input
                    placeholder="Filter By Menu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-full sm:w-[200px] lg:w-[320px]"
                />
                <FacetedFilter
                    title="Status"
                    options={MENU_ITEM_STATUS_OPTIONS}
                    onFilterChange={setStatuses}
                    value={statuses}
                />
                <FacetedFilter
                    title="Food Type"
                    options={MENU_ITEM_FOOD_OPTIONS}
                    onFilterChange={setFoodTypes}
                    value={foodTypes}
                />
                <FacetedFilter
                    title="Category"
                    options={categoryOptions}
                    onFilterChange={setCategories}
                    value={categories}
                />
                <FacetedFilter
                    title="Availability"
                    options={MENU_ITEM_STOCK_OPTIONS}
                    onFilterChange={setAvailability}
                    value={availability}
                />
                <MenuItemsPriceFilter value={price} onChange={setPrice} />
                {hasAnyFilter && (
                    <Button
                        variant="ghost"
                        onClick={onReset}
                        className="text-red-500 h-8 px-1 lg:px-2 hover:bg-red-100 hover:text-red-700"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
