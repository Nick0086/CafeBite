import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { Plus, SquarePen } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { CachedImage } from '@/components/ui/CachedImage';
import { imageCache } from '@/lib/ImageCacheService';
import { PermissionsContext } from '@/contexts/PermissionsContext';
import { VegStatusBadge } from '@/common/StatusBadge';
import MenuItemFilters from './components/MenuItemFilters';
import { BlobHealthChecker } from '@/utils/blobHealthCheck';

const OptimizedImage = ({ src, alt }) => {
    const { ref, inView } = useInView({ threshold: 0.1, rootMargin: '150px' });
    return (
        <div ref={ref} className="w-full h-56 rounded-lg overflow-hidden">
            {inView ? (
                <CachedImage
                    src={src}
                    alt={alt || 'Menu Items'}
                    className="w-full h-full object-cover"
                    width={400}
                    height={224}
                    quality={0.8}
                    lazy={false}
                    placeholder={true}
                />
            ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )}
        </div>
    );
};

const MenuItem = ({ item, onEdit, currencySymbol }) => {
    const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true, rootMargin: '100px 0px' });
    const mountedRef = useRef(true);

    useEffect(() => () => { mountedRef.current = false; }, []);

    useEffect(() => {
        if (inView && item?.image_details?.url) {
            imageCache
                .preloadImage(item.image_details.url, { width: 400, height: 224, quality: 0.8 })
                .catch((err) => { if (mountedRef.current) console.warn('Failed to preload image:', item.image_details.url, err); });
        }
    }, [inView, item?.image_details?.url]);

    return (
        <div ref={ref} className="h-full">
            {inView ? (
                <Card className="flex flex-col justify-between overflow-hidden h-full relative">
                    <div className="absolute top-2 left-2 z-[1] p-1">
                        <VegStatusBadge type={item?.veg_status} />
                    </div>
                    <Button
                        onClick={onEdit}
                        className="absolute top-2 right-2 z-[1] p-1"
                        variant="primary"
                        size="xs"
                    >
                        <SquarePen size={16} />
                    </Button>

                    <OptimizedImage src={item?.image_details?.url} alt={item?.name} />

                    <CardContent className="flex flex-col flex-auto justify-between p-4 px-2">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-lg text-primary">{item?.name}</CardTitle>
                            <CardDescription className="text-secondary">{item?.description}</CardDescription>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-base font-bold flex items-center gap-1">
                                {currencySymbol} {item?.price}
                            </span>
                            <div className="flex items-center gap-1">
                                {item.availability === 'in_stock' ? (
                                    <Chip variant="light" color="green" radius="md" size="xs">In Stock</Chip>
                                ) : (
                                    <Chip variant="light" color="red" radius="md" size="xs">Out of Stock</Chip>
                                )}
                                {item.status ? (
                                    <Chip variant="light" color="green" radius="md" size="xs">Active</Chip>
                                ) : (
                                    <Chip variant="light" color="red" radius="md" size="xs">Inactive</Chip>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse" />
            )}
        </div>
    );
};

const LoadingSkeleton = () => (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
            <Card key={`loading-${index}`} className="flex flex-col justify-between overflow-hidden">
                <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <CardContent className="p-4 pt-0">
                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-4" />
                    <div className="flex justify-between">
                        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);

export default function MenuCard({ data, isLoading, setIsModalOpen, categoryOptions }) {
    const { permissions } = useContext(PermissionsContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [menuAvailability, setMenuAvailability] = useState([]);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [selectFoodType, setSelectFoodType] = useState([]);

    const menuItems = data?.menuItems || [];

    useEffect(() => {
        if (!import.meta.env.DEV) return undefined;
        if (menuItems.length === 0) return undefined;
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
    }, [menuItems.length]);

    const filteredItems = useMemo(
        () =>
            menuItems.filter((item) => {
                const matchesSearch = item?.name?.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
                const matchesAvailability = menuAvailability.length === 0 || menuAvailability.includes(item.availability);
                const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category_name);
                const matchFoodType = selectFoodType.length === 0 || selectFoodType.includes(item.veg_status);
                return matchesSearch && matchesStatus && matchesAvailability && matchesCategory && matchFoodType;
            }),
        [menuItems, searchQuery, selectedStatuses, menuAvailability, selectedCategories, selectFoodType]
    );

    const groupedItems = useMemo(
        () =>
            filteredItems.reduce((acc, item) => {
                const category = item.category_name || 'Uncategorized';
                if (!acc[category]) acc[category] = [];
                acc[category].push(item);
                return acc;
            }, {}),
        [filteredItems]
    );

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedStatuses([]);
        setMenuAvailability([]);
        setSelectedCategories([]);
        setSelectFoodType([]);
    };

    if (isLoading) return <LoadingSkeleton />;

    if (menuItems.length === 0) {
        return (
            <div className="flex items-center justify-center w-full h-[60dvh]">
                <p className="text-xl font-semibold text-primary">No menu items found</p>
            </div>
        );
    }

    return (
        <>
            <MenuItemFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedStatuses={selectedStatuses}
                setSelectedStatuses={setSelectedStatuses}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                menuAvailability={menuAvailability}
                setMenuAvailability={setMenuAvailability}
                categoryOptions={categoryOptions}
                resetFilters={resetFilters}
                setSelectFoodType={setSelectFoodType}
                selectFoodType={selectFoodType}
            />

            {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="pb-6 mb-4 border-b-2 border-dashed border-indigo-300 px-2">
                    <div className="flex items-center justify-between bg-muted/80 p-3 rounded-md mb-2">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-1.5 bg-primary rounded-full hidden sm:block" />
                            <h2 className="text-xl font-semibold">{category}</h2>
                            <Chip variant="light" color="slate" radius="md" size="xs">
                                {items.length} {items.length === 1 ? 'Item' : 'Items'}
                            </Chip>
                        </div>
                        <Button
                            onClick={() =>
                                setIsModalOpen((prev) => ({
                                    ...prev,
                                    open: true,
                                    mode: 'create',
                                    isDirect: true,
                                    data: {
                                        name: '',
                                        description: '',
                                        price: '',
                                        cover_image: '',
                                        category_id: items[0]?.category_id,
                                        status: 1,
                                        availability: 'in_stock',
                                    },
                                }))
                            }
                            className="!text-xs text-indigo-500 gap-2 border bg-white hover:text-white border-indigo-500 hover:bg-indigo-500"
                            size="xs"
                        >
                            <Plus size={14} /> Add to {category}
                        </Button>
                    </div>

                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                        {items.map((item) => (
                            <MenuItem
                                key={item.unique_id || item.id}
                                item={item}
                                onEdit={() =>
                                    setIsModalOpen((prv) => ({
                                        ...prv,
                                        open: true,
                                        mode: 'edit',
                                        data: item,
                                        isDirect: false,
                                    }))
                                }
                                currencySymbol={permissions?.currency_symbol}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </>
    );
}
