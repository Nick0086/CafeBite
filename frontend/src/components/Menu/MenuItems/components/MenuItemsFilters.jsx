import { useMemo, useState } from 'react';
import { FacetedFilter } from '@/components/ui/FacetedFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import {
    MENU_ITEM_FOOD_OPTIONS,
    MENU_ITEM_STATUS_OPTIONS,
    MENU_ITEM_STOCK_OPTIONS,
} from '../constants/menuItem.constants';
import MenuItemsPriceFilter from './MenuItemsPriceFilter';
import MenuItemsMobileFilterDrawer from './MenuItemsMobileFilterDrawer';

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
    const isMobile = useIsMobile();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const totalSelected = useMemo(
        () =>
            statuses.length +
            foodTypes.length +
            categories.length +
            availability.length +
            (price ? 1 : 0),
        [statuses, foodTypes, categories, availability, price]
    );

    return (
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-slate-100 px-2 sm:px-3 py-2 sm:py-3">
            <div className={isMobile ? 'flex gap-2 items-center' : 'flex flex-wrap gap-2 items-center'}>
                <div className={isMobile ? 'relative flex-1' : 'relative w-full sm:w-[200px] lg:w-[320px]'}>
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Filter By Menu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={isMobile ? 'h-11 pl-9 pr-8 rounded-lg bg-slate-50 border-slate-200 focus-visible:ring-primary text-sm placeholder:text-slate-400 font-medium' : 'h-9 pl-8'}
                    />
                    {search && isMobile && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {isMobile ? (
                    <Button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        className={cn(
                            "h-11 px-4 gap-2 rounded-lg font-semibold text-sm shadow-xs transition-all shrink-0 flex items-center justify-center",
                            totalSelected > 0
                                ? "bg-primary text-white hover:bg-primary/90"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                        )}
                        aria-label="Open filters"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>Filters</span>
                        {totalSelected > 0 && (
                            <span className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-900 text-xs font-bold shadow-xs">
                                {totalSelected}
                            </span>
                        )}
                    </Button>
                ) : (
                    <>
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
                        <MenuItemsPriceFilter onChange={setPrice} />
                    </>
                )}

                {hasAnyFilter && !isMobile && (
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

            {isMobile && (
                <MenuItemsMobileFilterDrawer
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    statuses={statuses}
                    setStatuses={setStatuses}
                    foodTypes={foodTypes}
                    setFoodTypes={setFoodTypes}
                    categories={categories}
                    setCategories={setCategories}
                    availability={availability}
                    setAvailability={setAvailability}
                    price={price}
                    setPrice={setPrice}
                    categoryOptions={categoryOptions}
                    onReset={onReset}
                />
            )}
        </div>
    );
}
