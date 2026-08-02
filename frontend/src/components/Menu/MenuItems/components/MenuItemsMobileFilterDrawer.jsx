import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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

const PillGroup = ({ options = [], selected = [], onChange }) => {
    const toggle = (val) => {
        const next = selected.includes(val)
            ? selected.filter((item) => item !== val)
            : [...selected, val];
        onChange(next);
    };

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {options.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                    <button
                        type="button"
                        key={String(opt.value)}
                        onClick={() => toggle(opt.value)}
                        className={cn(
                            "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border shadow-2xs",
                            isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                        )}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
};

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
            <DrawerContent className="max-h-[85vh] flex flex-col rounded-t-2xl">
                <DrawerHeader className="flex flex-row items-center justify-between border-b px-4 pt-1 pb-2.5 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                            <SlidersHorizontal className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left">
                            <DrawerTitle className="text-base font-semibold">Filters</DrawerTitle>
                            {totalPending > 0 ? (
                                <p className="text-xs text-primary font-medium">
                                    {totalPending} active filters selected
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Refine your view
                                </p>
                            )}
                        </div>
                    </div>
                    <DrawerClose asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" aria-label="Close filters">
                            <X className="h-4 w-4" />
                        </Button>
                    </DrawerClose>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                    <DrawerDescription className="sr-only">Refine the menu items list by price, status, food type, category and availability.</DrawerDescription>

                    <section className="rounded-xl border bg-card p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Range</h4>
                            {pending.price && (
                                <Badge variant="secondary" className="h-5 px-2 text-[10px] bg-primary/10 text-primary font-semibold">
                                    Active
                                </Badge>
                            )}
                        </div>
                        <MenuItemsPriceFilter
                            value={pending.price}
                            onChange={(next) => setPending((p) => ({ ...p, price: next }))}
                        />
                    </section>

                    <section className="rounded-xl border bg-card p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</h4>
                            {pending.statuses.length > 0 && (
                                <Badge variant="secondary" className="h-5 px-2 text-[10px] bg-primary/10 text-primary font-semibold">
                                    {pending.statuses.length} selected
                                </Badge>
                            )}
                        </div>
                        <PillGroup
                            options={MENU_ITEM_STATUS_OPTIONS}
                            selected={pending.statuses}
                            onChange={(v) => setPending((p) => ({ ...p, statuses: v }))}
                        />
                    </section>

                    <section className="rounded-xl border bg-card p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Food Type</h4>
                            {pending.foodTypes.length > 0 && (
                                <Badge variant="secondary" className="h-5 px-2 text-[10px] bg-primary/10 text-primary font-semibold">
                                    {pending.foodTypes.length} selected
                                </Badge>
                            )}
                        </div>
                        <PillGroup
                            options={MENU_ITEM_FOOD_OPTIONS}
                            selected={pending.foodTypes}
                            onChange={(v) => setPending((p) => ({ ...p, foodTypes: v }))}
                        />
                    </section>

                    <section className="rounded-xl border bg-card p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</h4>
                            {pending.categories.length > 0 && (
                                <Badge variant="secondary" className="h-5 px-2 text-[10px] bg-primary/10 text-primary font-semibold">
                                    {pending.categories.length} selected
                                </Badge>
                            )}
                        </div>
                        <PillGroup
                            options={categoryOptions}
                            selected={pending.categories}
                            onChange={(v) => setPending((p) => ({ ...p, categories: v }))}
                        />
                    </section>

                    <section className="rounded-xl border bg-card p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Availability</h4>
                            {pending.availability.length > 0 && (
                                <Badge variant="secondary" className="h-5 px-2 text-[10px] bg-primary/10 text-primary font-semibold">
                                    {pending.availability.length} selected
                                </Badge>
                            )}
                        </div>
                        <PillGroup
                            options={MENU_ITEM_STOCK_OPTIONS}
                            selected={pending.availability}
                            onChange={(v) => setPending((p) => ({ ...p, availability: v }))}
                        />
                    </section>
                </div>

                <DrawerFooter className="border-t bg-background px-4 py-2.5 shrink-0 flex-row items-center gap-2.5">
                    <Button
                        variant="outline"
                        onClick={handleClear}
                        disabled={totalPending === 0}
                        className="w-24 h-10 text-red-500 hover:text-red-600 hover:bg-red-50 font-semibold rounded-xl px-3 text-xs shrink-0"
                    >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                        Reset
                    </Button>
                    <Button
                        variant='gradient'
                        onClick={handleApply}
                        className="flex-1 h-10 gap-2 rounded-xl font-semibold shadow-sm text-sm"
                    >
                        <Check className="h-4 w-4" />
                        Apply Filters {totalPending > 0 ? `(${totalPending})` : ''}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
