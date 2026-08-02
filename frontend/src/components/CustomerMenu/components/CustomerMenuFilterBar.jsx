import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

const FOOD_TYPES = [
    { label: 'Veg', value: 'veg', color: 'bg-green-500' },
    { label: 'Non-Veg', value: 'non_veg', color: 'bg-red-500' },
];

export default function CustomerMenuFilterBar({
    searchQuery,
    onSearchChange,
    selectedFoodTypes,
    onFoodTypeChange,
    selectedCategories,
    onCategoryChange,
    categories = [],
    styles = {},
}) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [pendingFoodTypes, setPendingFoodTypes] = useState(selectedFoodTypes);
    const [pendingCategories, setPendingCategories] = useState(selectedCategories);

    useEffect(() => {
        if (drawerOpen) {
            setPendingFoodTypes(selectedFoodTypes);
            setPendingCategories(selectedCategories);
        }
    }, [drawerOpen, selectedFoodTypes, selectedCategories]);

    const activeCount = selectedFoodTypes.length + selectedCategories.length;
    const pendingCount = pendingFoodTypes.length + pendingCategories.length;

    const togglePendingFood = (val) => {
        setPendingFoodTypes((prev) =>
            prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
        );
    };

    const togglePendingCategory = (val) => {
        setPendingCategories((prev) =>
            prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
        );
    };

    const handleApply = () => {
        onFoodTypeChange(pendingFoodTypes);
        onCategoryChange(pendingCategories);
        setDrawerOpen(false);
    };

    const handleClear = () => {
        setPendingFoodTypes([]);
        setPendingCategories([]);
    };

    return (
        <div className="sticky top-2 z-20">
            <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Search food, drinks..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-10 pl-9 pr-8 bg-slate-50 border-slate-200 focus-visible:ring-primary rounded-lg text-sm font-medium placeholder:text-slate-400"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <Button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    style={activeCount > 0 ? styles?.buttonBackgroundStyle : undefined}
                    className={cn(
                        "h-10 px-3.5 gap-2 rounded-lg font-semibold text-sm shadow-2xs transition-all shrink-0",
                        activeCount > 0
                            ? "bg-primary text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                    )}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeCount > 0 && (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-900 text-xs font-bold shadow-xs">
                            {activeCount}
                        </span>
                    )}
                </Button>
            </div>

            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent className="max-h-[85vh] flex flex-col rounded-t-2xl">
                    <DrawerHeader className="flex flex-row items-center justify-between border-b px-4 pt-1 pb-2.5 shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <SlidersHorizontal className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                                <DrawerTitle className="text-base font-bold text-slate-900">Filters</DrawerTitle>
                                {pendingCount > 0 ? (
                                    <p className="text-xs text-primary font-semibold">
                                        {pendingCount} active filters selected
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-500">
                                        Refine by food type & category
                                    </p>
                                )}
                            </div>
                        </div>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                <X className="h-4 w-4" />
                            </Button>
                        </DrawerClose>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <DrawerDescription className="sr-only">Filter menu by dietary preference and category</DrawerDescription>

                        {/* Dietary Preference */}
                        <div className="rounded-xl border bg-card p-3.5 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Food Type</h4>
                                {pendingFoodTypes.length > 0 && (
                                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                        {pendingFoodTypes.length} selected
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {FOOD_TYPES.map((type) => {
                                    const isSelected = pendingFoodTypes.includes(type.value);
                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => togglePendingFood(type.value)}
                                            className={cn(
                                                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border",
                                                isSelected
                                                    ? "bg-slate-900 text-white border-slate-900 shadow-xs scale-[1.02]"
                                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                                            )}
                                        >
                                            <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", type.color)} />
                                            {type.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Categories */}
                        {categories.length > 0 && (
                            <div className="rounded-xl border bg-card p-3.5 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</h4>
                                    {pendingCategories.length > 0 && (
                                        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                            {pendingCategories.length} selected
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => {
                                        const id = cat.id || cat.unique_id;
                                        const isSelected = pendingCategories.includes(id);
                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => togglePendingCategory(id)}
                                                className={cn(
                                                    "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border",
                                                    isSelected
                                                        ? "bg-primary text-white border-primary shadow-xs scale-[1.02]"
                                                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                                                )}
                                                style={isSelected ? styles?.buttonBackgroundStyle : undefined}
                                            >
                                                {cat.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <DrawerFooter className="border-t bg-background px-4 py-2.5 shrink-0 flex-row items-center gap-2.5">
                        <Button
                            variant="outline"
                            onClick={handleClear}
                            disabled={pendingCount === 0}
                            className="w-24 h-10 text-red-500 hover:text-red-600 hover:bg-red-50 font-semibold rounded-xl px-3 text-xs shrink-0"
                        >
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                            Reset
                        </Button>
                        <Button
                            onClick={handleApply}
                            style={styles?.buttonBackgroundStyle}
                            className="flex-1 h-10 gap-2 rounded-xl font-semibold shadow-sm text-sm"
                        >
                            <Check className="h-4 w-4" />
                            Apply Filters {pendingCount > 0 ? `(${pendingCount})` : ''}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
