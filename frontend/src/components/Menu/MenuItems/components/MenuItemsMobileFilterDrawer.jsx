import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FacetedFilter } from '@/components/ui/FacetedFilter';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { SlidersHorizontal, X, RotateCcw, Check } from 'lucide-react';
import MenuItemsPriceFilter from './MenuItemsPriceFilter';
import {
    MENU_ITEM_FOOD_OPTIONS,
    MENU_ITEM_STATUS_OPTIONS,
    MENU_ITEM_STOCK_OPTIONS,
} from '../constants/menuItem.constants';

export default function MenuItemsMobileFilterDrawer({
    open,
    onOpenChange,
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
}) {
    const [pending, setPending] = useState({
        statuses,
        foodTypes,
        categories,
        availability,
        price,
    });

    useEffect(() => {
        if (open) {
            setPending({ statuses, foodTypes, categories, availability, price });
        }
    }, [open, statuses, foodTypes, categories, availability, price]);

    const totalPending =
        pending.statuses.length +
        pending.foodTypes.length +
        pending.categories.length +
        pending.availability.length +
        (pending.price ? 1 : 0);

    const handleApply = () => {
        setStatuses(pending.statuses);
        setFoodTypes(pending.foodTypes);
        setCategories(pending.categories);
        setAvailability(pending.availability);
        setPrice(pending.price);
        onOpenChange(false);
    };

    const handleClear = () => {
        setPending({ statuses: [], foodTypes: [], categories: [], availability: [], price: null });
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[90vh]">
                <DrawerHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <SlidersHorizontal className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <DrawerTitle className="text-base">Filters</DrawerTitle>
                            {totalPending > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    {totalPending} selected
                                </p>
                            )}
                        </div>
                    </div>
                    <DrawerClose asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" aria-label="Close filters">
                            <X className="h-4 w-4" />
                        </Button>
                    </DrawerClose>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    <DrawerDescription className="sr-only">Refine the menu items list by price, status, food type, category and availability.</DrawerDescription>

                    <section className="rounded-lg border bg-card p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price</h4>
                            {pending.price && (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                    Active
                                </Badge>
                            )}
                        </div>
                        <MenuItemsPriceFilter
                            value={pending.price}
                            onChange={(next) => setPending((p) => ({ ...p, price: next }))}
                        />
                    </section>

                    <section className="rounded-lg border bg-card p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</h4>
                            {pending.statuses.length > 0 && (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                    {pending.statuses.length}
                                </Badge>
                            )}
                        </div>
                        <FacetedFilter
                            title="Status"
                            options={MENU_ITEM_STATUS_OPTIONS}
                            onFilterChange={(v) => setPending((p) => ({ ...p, statuses: v }))}
                            value={pending.statuses}
                        />
                    </section>

                    <section className="rounded-lg border bg-card p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Food Type</h4>
                            {pending.foodTypes.length > 0 && (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                    {pending.foodTypes.length}
                                </Badge>
                            )}
                        </div>
                        <FacetedFilter
                            title="Food Type"
                            options={MENU_ITEM_FOOD_OPTIONS}
                            onFilterChange={(v) => setPending((p) => ({ ...p, foodTypes: v }))}
                            value={pending.foodTypes}
                        />
                    </section>

                    <section className="rounded-lg border bg-card p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</h4>
                            {pending.categories.length > 0 && (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                    {pending.categories.length}
                                </Badge>
                            )}
                        </div>
                        <FacetedFilter
                            title="Category"
                            options={categoryOptions}
                            onFilterChange={(v) => setPending((p) => ({ ...p, categories: v }))}
                            value={pending.categories}
                        />
                    </section>

                    <section className="rounded-lg border bg-card p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Availability</h4>
                            {pending.availability.length > 0 && (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                    {pending.availability.length}
                                </Badge>
                            )}
                        </div>
                        <FacetedFilter
                            title="Availability"
                            options={MENU_ITEM_STOCK_OPTIONS}
                            onFilterChange={(v) => setPending((p) => ({ ...p, availability: v }))}
                            value={pending.availability}
                        />
                    </section>

                    <Separator />

                    <Button
                        variant="ghost"
                        onClick={handleClear}
                        disabled={totalPending === 0}
                        className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Clear all
                    </Button>
                </div>

                <DrawerFooter className="border-t bg-background px-4 py-3">
                    <div className="flex gap-2">
                        <DrawerClose asChild>
                            <Button variant="outline" className="flex-1 h-11">
                                Cancel
                            </Button>
                        </DrawerClose>
                        <Button
                            onClick={handleApply}
                            className="flex-[1.4] h-11 gap-1.5"
                        >
                            <Check className="h-4 w-4" />
                            Apply{totalPending > 0 ? ` (${totalPending})` : ''}
                        </Button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
