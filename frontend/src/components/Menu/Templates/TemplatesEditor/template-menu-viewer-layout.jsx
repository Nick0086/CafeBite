import React, { memo, useEffect, useState, useMemo, useContext, useCallback } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardTitle, } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { cn } from '@/lib/utils';
import { useInView } from 'react-intersection-observer';
import { DEFAULT_SECTION_THEME } from '../utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { CachedImage } from '@/components/ui/CachedImage';
import { imageCache } from '@/services/ImageCacheService';
import { useMenuPreloader } from '@/hooks/useMenuPreloader';
import { PermissionsContext } from '@/contexts/PermissionsContext';
import { useTemplate } from '@/contexts/TemplateContext';
import { Separator } from '@/components/ui/separator';
import { Edit, PenIcon } from 'lucide-react';

/* Enhanced OptimizedImage with caching */
const OptimizedImage = memo(({ src, alt, currentView }) => {
    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: '150px',
        triggerOnce: true,
    });

    return (
        <div ref={ref} className={cn("rounded-lg overflow-hidden", currentView ? 'w-[124px] min-w-[124px] h-[100px]' : 'w-full h-64')}>
            {inView ? (
                <CachedImage
                    src={src}
                    alt={alt || 'Menu item'}
                    className="object-cover"
                    currentView={currentView}
                    quality={0.8}
                    lazy={false}
                    placeholder={true}
                    showCacheStatus={process.env.NODE_ENV === 'development'}
                />
            ) : (
                <div className={cn("bg-gray-200 rounded-lg flex items-center justify-center animate-pulse", currentView ? 'w-[124px] h-[100px]' : 'w-full h-64')}>
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
});

const StatusBadge = memo(({ type, currentView }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Chip className='gap-1 h-6 w-6 bg-white p-0 flex items-center justify-center' variant='outline' radius='md' size='sm' color={type === "veg" ? 'green' : 'red'}>
                        <div className={cn("h-3 w-3 rounded-full", type === "veg" ? "bg-green-500" : "bg-red-500")} />
                    </Chip>
                </TooltipTrigger>
                <TooltipContent className='z-50' >
                    <p>{type === "veg" ? "Veg" : "Non Veg"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
})

/* Enhanced MenuItem with better caching and state management */
const MenuItem = memo(({ item, globalConfig, categoryStyle, currencySymbol, currentView }) => {
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const isInStock = item.availability === 'in_stock';
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: false, // Allow re-triggering for better scroll handling
        rootMargin: '100px 0px',
    });

    // Preload image when first visible
    useEffect(() => {
        if (inView && !hasBeenVisible && item?.image_details?.url) {
            setHasBeenVisible(true);

            // Preload image in background
            imageCache.preloadImage(item.image_details.url, {
                width: 400,
                height: 256,
                quality: 0.8
            }).catch(error => {
                console.warn('Failed to preload template image:', item.image_details.url, error);
            });
        }
    }, [inView, hasBeenVisible, item?.image_details?.url]);

    const cardStyle = useMemo(() => {
        if (
            categoryStyle?.card_background_color &&
            DEFAULT_SECTION_THEME?.card_background_color !== categoryStyle?.card_background_color
        ) {
            return { backgroundColor: categoryStyle.card_background_color };
        }
        if (globalConfig?.card_background_color) {
            return { backgroundColor: globalConfig.card_background_color };
        }
        return {};
    }, [globalConfig?.card_background_color, categoryStyle?.card_background_color]);

    const titleStyle = useMemo(() => {
        if (
            categoryStyle?.card_title_color &&
            DEFAULT_SECTION_THEME?.card_title_color !== categoryStyle?.card_title_color
        ) {
            return { color: categoryStyle.card_title_color };
        }
        if (globalConfig?.card_title_color) {
            return { color: globalConfig.card_title_color };
        }
        return {};
    }, [globalConfig?.card_title_color, categoryStyle?.card_title_color]);

    const descriptionStyle = useMemo(() => {
        if (
            categoryStyle?.description_color &&
            DEFAULT_SECTION_THEME?.description_color !== categoryStyle?.description_color
        ) {
            return { color: categoryStyle.description_color };
        }
        if (globalConfig?.description_color) {
            return { color: globalConfig.description_color };
        }
        return {};
    }, [globalConfig?.description_color, categoryStyle?.description_color]);

    const buttonBackgroundStyle = useMemo(() => {
        if (
            categoryStyle?.button_background_color &&
            DEFAULT_SECTION_THEME?.button_background_color !== categoryStyle?.button_background_color
        ) {
            return { backgroundColor: categoryStyle.button_background_color };
        }
        if (globalConfig?.button_background_color) {
            return { backgroundColor: globalConfig.button_background_color };
        }
        return {};
    }, [globalConfig?.button_background_color, categoryStyle?.button_background_color]);

    const buttonLabelStyle = useMemo(() => {
        if (
            categoryStyle?.button_label_color &&
            DEFAULT_SECTION_THEME?.button_label_color !== categoryStyle?.button_label_color
        ) {
            return { color: categoryStyle.button_label_color };
        }
        if (globalConfig?.button_label_color) {
            return { color: globalConfig.button_label_color };
        }
        return {};
    }, [globalConfig?.button_label_color, categoryStyle?.button_label_color]);

    return (
        <div ref={ref} className="h-full">
            {/* Always render if it has been visible once to prevent blob URL issues */}
            {(inView || hasBeenVisible) ? (
                <Card style={cardStyle} className={cn("flex flex-col justify-between overflow-hidden h-full relative", currentView === 'list' && 'flex-row p-3 gap-4')}>
                    {currentView === 'list' ? "" : <div className='absolute top-2 right-2 z-[1]' >
                        <StatusBadge type={item?.veg_status} />
                    </div>}
                    <OptimizedImage src={item?.image_details?.url} alt={item?.name} currentView={currentView === 'list'} />
                    <CardContent className={cn("flex flex-col flex-auto justify-between p-4 px-2", currentView === 'list' && 'p-0')}>
                        <div className="flex flex-col gap-1">
                            <CardTitle style={titleStyle} className="md:text-lg text-base text-primary flex items-center gap-2">
                                {item?.name}
                            </CardTitle>
                            <CardDescription style={descriptionStyle} className="text-secondary md:text-sm text-xs">
                                {item?.description}
                            </CardDescription>
                        </div>
                        <div className="flex sm:flex-row-reverse flex-col justify-between mt-2 gap-1">
                            {/* Uncomment if needed
                            <Button disabled={!(item.availability === 'in_stock')} style={buttonBackgroundStyle} variant='primary' size='sm' > 
                                <p style={buttonLabelStyle} > {item.availability === 'in_stock' ? "Order" : "Out of Stock"}</p>
                            </Button>
                            */}
                            <div className='flex items-center gap-2' >
                                <StatusBadge type={item?.veg_status} currentView={currentView} />
                                <Separator orientation='vertical' className='bg-gray-400' />
                                <Chip variant="light" color={isInStock ? "green" : "red"} radius="md" size="xs">{isInStock ? "In Stock" : "Out Of Stock"}</Chip>
                            </div>
                            <span style={titleStyle} className="text-base font-bold">
                                {currencySymbol} {item?.price}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse" />
            )}
        </div>
    );
});

/* Enhanced CategoryAccordion with image preloading */
const CategoryAccordion = memo(({ category, globalConfig, itemEditHander, currencySymbol, currentView }) => {
    const categoryId = category.id || category.unique_id || category.name;
    const categoryStyle = category?.style || {};
    const [hasBeenVisible, setHasBeenVisible] = useState(false);

    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: '300px 0px',
        triggerOnce: false,
    });

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (inView && !isLoaded) {
            setIsLoaded(true);
            setHasBeenVisible(true);
        }
    }, [inView, isLoaded]);

    // Preload category images when visible
    useEffect(() => {
        if (inView && !hasBeenVisible && category?.items) {
            const imageUrls = category.items
                .filter(item => item?.visible && item?.image_details?.url)
                .map(item => item.image_details.url);

            if (imageUrls.length > 0) {
                console.log(`Preloading ${imageUrls.length} images for category: ${category.name}`);

                // Preload in batches
                const batchSize = 3;
                const preloadBatch = async (urls, startIndex = 0) => {
                    const batch = urls.slice(startIndex, startIndex + batchSize);
                    if (batch.length === 0) return;

                    try {
                        await imageCache.preloadImages(batch, {
                            width: 400,
                            height: 256,
                            quality: 0.8
                        });

                        // Continue with next batch after a small delay
                        if (startIndex + batchSize < urls.length) {
                            setTimeout(() => preloadBatch(urls, startIndex + batchSize), 200);
                        }
                    } catch (error) {
                        console.warn('Category image preload batch failed:', error);
                    }
                };

                preloadBatch(imageUrls);
            }
            setHasBeenVisible(true);
        }
    }, [inView, hasBeenVisible, category?.items, category.name]);

    const sectionStyle = useMemo(() => {
        if (
            categoryStyle?.section_background_color &&
            DEFAULT_SECTION_THEME?.section_background_color !== categoryStyle?.section_background_color
        ) {
            return { backgroundColor: categoryStyle.section_background_color };
        }
        if (globalConfig?.section_background_color) {
            return { backgroundColor: globalConfig.section_background_color };
        }
        return {};
    }, [globalConfig?.section_background_color, categoryStyle?.section_background_color]);

    const titleBarStyle = useMemo(() => {
        if (
            categoryStyle?.title_color &&
            DEFAULT_SECTION_THEME?.title_color !== categoryStyle?.title_color
        ) {
            return { backgroundColor: categoryStyle.title_color };
        }
        if (globalConfig?.title_color) {
            return { backgroundColor: globalConfig.title_color };
        }
        return {};
    }, [globalConfig?.title_color, categoryStyle?.title_color]);

    const titleTextStyle = useMemo(() => {
        if (
            categoryStyle?.title_color &&
            DEFAULT_SECTION_THEME?.title_color !== categoryStyle?.title_color
        ) {
            return { color: categoryStyle.title_color };
        }
        if (globalConfig?.title_color) {
            return { color: globalConfig.title_color };
        }
        return {};
    }, [globalConfig?.title_color, categoryStyle?.title_color]);

    const visibleItems = useMemo(() =>
        category?.items?.filter(item => item?.visible) || [],
        [category?.items]
    );

    const handleMenuEdit = useCallback((e) => {
        e.stopPropagation();
        itemEditHander(categoryId);
    }, []);

    return (
        <AccordionItem key={categoryId} value={categoryId} className={cn('bg-card rounded-md overflow-hidden border-none px-3')} style={sectionStyle} id={categoryId} ref={ref}>
            <AccordionTrigger className="py-3 px-2 hover:no-underline">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-1.5 bg-primary rounded-full hidden sm:block" style={titleBarStyle} />
                    <h2 style={titleTextStyle} className="text-xl font-semibold">
                        {category?.name}
                    </h2>
                    {/* Add item count indicator */}
                    <Chip variant="light" color="slate" radius="md" size="xs">
                        {visibleItems.length} items
                    </Chip>
                    <Button onClick={handleMenuEdit} variant='submit' type='button' size='icon' className='h-7 w-7' ><Edit size={14} /></Button>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
                {(inView || isLoaded) ? (
                    <div className={cn("grid  gap-4", currentView === 'grid' ? 'lg:grid-cols-3 md:grid-cols-2 grid-cols-1' : 'grid-cols-1')}>
                        {visibleItems.length > 0 ? visibleItems.map(item => (
                            <MenuItem
                                key={item.unique_id || item.id}
                                globalConfig={globalConfig}
                                categoryStyle={categoryStyle}
                                item={item}
                                currencySymbol={currencySymbol}
                                currentView={currentView}
                            />
                        )) : (
                            <p className='flex items-center justify-center h-20 font-semibold text-lg w-full lg:col-span-3 md:col-span-2 col-span-1'>
                                No Item Available
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="h-20 bg-gray-100 animate-pulse rounded-md" />
                )}
            </AccordionContent>
        </AccordionItem>
    );
});

export default function TemplateMenuViewerLayout({ templateConfig , setCurrenctCategoryItems}) {
    const { permissions } = useContext(PermissionsContext);
    const categories = templateConfig?.categories || [];
    const globalFromConfig = templateConfig?.global || {};
    const [firstCategoryId, setFirstCategoryId] = useState([]);
    const { currentView, handleTabChange, setCurrentSubItemTab } = useTemplate();

    const globalConfig = useMemo(
        () => ({
            background_color: globalFromConfig.background_color,
            section_background_color: globalFromConfig.section_background_color,
            title_color: globalFromConfig.title_color,
            card_title_color: globalFromConfig.card_title_color,
            card_background_color: globalFromConfig.card_background_color,
            description_color: globalFromConfig.description_color,
            button_label_color: globalFromConfig.button_label_color,
            button_background_color: globalFromConfig.button_background_color,
        }),
        [
            globalFromConfig.background_color,
            globalFromConfig.section_background_color,
            globalFromConfig.title_color,
            globalFromConfig.card_title_color,
            globalFromConfig.card_background_color,
            globalFromConfig.description_color,
            globalFromConfig.button_label_color,
            globalFromConfig.button_background_color,
        ]
    );

    const visibleCategories = useMemo(
        () => categories.filter(category => category?.visible),
        [categories]
    );

    const firstCategory = useMemo(() => {
        if (visibleCategories.length > 0) {
            const firstCategory = visibleCategories[0];
            return firstCategory.id || firstCategory.unique_id || firstCategory.name;
        }
        return null;
    }, [visibleCategories]);

    useEffect(() => {
        if (firstCategory) {
            setFirstCategoryId([firstCategory]);
        }
    }, [firstCategory])

    const accordingHander = (e) => {
        setFirstCategoryId(e);
    }

    const itemEditHander = (e) => {
        if (!firstCategoryId?.includes(e)) {
            setFirstCategoryId((prv) => ([...prv, e]));
        }
        setCurrenctCategoryItems(e)
        handleTabChange('items')
        setCurrentSubItemTab("item")
    }

    const containerStyle = useMemo(
        () => (globalConfig?.background_color ? { backgroundColor: globalConfig.background_color } : {}),
        [globalConfig?.background_color]
    );

    return (
        <div className="p-4 max-h-[calc(100dvh-48px)] min-h-[calc(100dvh-48px)] min overflow-auto" style={containerStyle}>
            <Accordion
                type="multiple"
                value={firstCategoryId}
                defaultValue={firstCategoryId ? firstCategoryId : []}
                className="space-y-4"
                onValueChange={accordingHander}
            >
                {visibleCategories.map(category => (
                    <CategoryAccordion
                        itemEditHander={itemEditHander}
                        key={category.id || category.unique_id || category.name}
                        globalConfig={globalConfig}
                        category={category}
                        currencySymbol={permissions?.currency_symbol}
                        currentView={currentView}
                    />
                ))}
            </Accordion>
        </div>
    );
}
