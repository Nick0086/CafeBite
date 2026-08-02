import { useContext, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PermissionsContext } from '@/contexts/PermissionsContext';
import { BlobHealthChecker } from '@/utils/blobHealthCheck';
import MenuItemsFilters from '../MenuItemsFilters';
import MenuItemCard from './MenuItemCard';
import MenuItemEmptyState from './MenuItemEmptyState';
import MenuItemsCardGridHeader from './MenuItemsCardGridHeader';

const LoadingSkeleton = () => (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 p-3 sm:p-4">
        {Array.from({ length: 6 }).map((_, index) => (
            <Card key={`loading-${index}`} className="flex flex-col justify-between overflow-hidden">
                <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </Card>
        ))}
    </div>
);

export default function MenuItemsCardGrid({ items, isLoading, categoryOptions, filter, onCreate, onCreateInCategory, onEdit }) {
    const { permissions } = useContext(PermissionsContext);
    const currencySymbol = permissions?.currency_symbol;

    const { filterItems, reset, hasAnyFilter } = filter;

    useEffect(() => {
        if (!import.meta.env.DEV) return undefined;
        if (!items || items.length === 0) return undefined;
        // ponytail: depend on items.length only — re-run health check when the count changes, not on every reference swap
        const healthCheck = async () => {
            try {
                const integrity = await BlobHealthChecker.validateCacheIntegrity();
                if (integrity.invalid > 0) {
                    console.warn(`Found ${integrity.invalid} corrupted blobs, repairing...`);
                    await BlobHealthChecker.repairCorruptedBlobs();
                }
            } catch (error) {
                console.error('Blob health check failed:', error);
            }
        };
        const timer = setTimeout(healthCheck, 3000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items?.length]);

    const filteredItems = useMemo(() => filterItems(items || []), [filterItems, items]);

    const groupedItems = useMemo(() =>
        filteredItems.reduce((acc, item) => {
            const category = item.category_name || 'Uncategorized';
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {}), [filteredItems]);

    const handleCreate = () => onCreate();

    if (isLoading) {
        return (
            <>
                <MenuItemsCardGridHeader onCreate={handleCreate} showAdd={(items?.length || 0) > 0} />
                <LoadingSkeleton />
            </>
        );
    }

    return (
        <Card className="border-none shadow-none p-0">
            <MenuItemsCardGridHeader onCreate={handleCreate} showAdd={(items?.length || 0) > 0} />

            {!items || items.length === 0 ? (
                <MenuItemEmptyState variant="noItems" onCreate={handleCreate} onClear={reset} />
            ) : (
                <>
                    <MenuItemsFilters
                        search={filter.search}
                        setSearch={filter.setSearch}
                        statuses={filter.statuses}
                        setStatuses={filter.setStatuses}
                        foodTypes={filter.foodTypes}
                        setFoodTypes={filter.setFoodTypes}
                        categories={filter.categories}
                        setCategories={filter.setCategories}
                        availability={filter.availability}
                        setAvailability={filter.setAvailability}
                        price={filter.price}
                        setPrice={filter.setPrice}
                        categoryOptions={categoryOptions}
                        hasAnyFilter={hasAnyFilter}
                        onReset={reset}
                    />

                    <div className="p-3 sm:p-4">
                        {filteredItems.length === 0 ? (
                            <MenuItemEmptyState variant="filtered" onCreate={handleCreate} onClear={reset} />
                        ) : (
                            Object.entries(groupedItems).map(([category, groupItems]) => (
                                <div key={category} className="pb-6 mb-4 border-b-2 border-dashed border-indigo-300">
                                    <div className="flex items-center justify-between bg-muted/80 p-3 rounded-md mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-1.5 bg-primary rounded-full hidden sm:block" />
                                            <h2 className="text-xl font-semibold">{category}</h2>
                                            <Chip variant="light" color="slate" radius="md" size="xs">
                                                {groupItems.length} {groupItems.length === 1 ? 'Item' : 'Items'}
                                            </Chip>
                                        </div>
                                        <Button
                                            onClick={() => onCreateInCategory(groupItems[0]?.category_id)}
                                            className="!text-xs text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500"
                                            size="xs"
                                        >
                                            <Plus size={14} /> Add Item
                                        </Button>
                                    </div>

                                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                                        {groupItems.map((item) => (
                                            <MenuItemCard
                                                key={item.unique_id || item.id}
                                                item={item}
                                                onEdit={() => onEdit(item)}
                                                currencySymbol={currencySymbol}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </Card>
    );
}
