

import React, { memo, useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CachedImage } from '../ui/CachedImage';
import { AppTooltip } from '@/common/AppTooltip';
import { Chip } from '../ui/chip';
import { cn } from '@/lib/utils';
import { Plus, Minus, MapPin, Phone, Mail } from 'lucide-react';
import { useOrder } from '@/contexts/order-management-context';
import { useMenuStyles } from './utils';
import { useTranslation } from 'react-i18next';
import { useMenuPreloader } from '@/hooks/useMenuPreloader';
import { Separator } from '../ui/separator';


const StatusBadge = memo(({ type }) => {
    return (
        <AppTooltip content={type === "veg" ? "Veg" : "Non Veg"} >
            <Chip className='gap-1 h-6 w-6 bg-white p-0 flex items-center justify-center' variant='outline' radius='md' size='sm' color={type === "veg" ? 'green' : 'red'}>
                <div className={cn("h-3 w-3 rounded-full", type === "veg" ? "bg-green-500" : "bg-red-500")} />
            </Chip>
        </AppTooltip>
    )
})

const OptimizedImage = memo(({ src, alt, currentView }) => {
    return (
        <CachedImage currentView src={src} alt={alt || 'Menu item'} className={cn("rounded-lg overflow-hidden", currentView ? 'w-[124px] min-w-[124px] h-[100px]' : 'w-full h-64')}  width={400} height={256} quality={0.8} lazy={true} placeholder={true}
        />
    );
});

const MenuItem = memo(({ item, styles, currencyInfo, currentView }) => {
    const { t } = useTranslation();
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true,
        rootMargin: '300px 0px',
    });

    const { addItem, removeItem, orderItems } = useOrder();

    // Memoize computed values for better performance
    const computedValues = useMemo(() => {
        const isInStock = item.availability === 'in_stock';
        const itemInOrder = orderItems.find(orderItem =>
            orderItem.id === item.id || orderItem.unique_id === item.unique_id
        );
        const price = parseFloat(item.price);

        return { isInStock, itemInOrder, price };
    }, [item.availability, item.id, item.unique_id, item.price, orderItems]);

    const { isInStock, itemInOrder, price } = computedValues;

    // Memoize handlers
    const handlers = useMemo(() => ({
        handleAddToOrder: () => {
            if (isInStock) {
                addItem({ id: item.id, unique_id: item.unique_id, name: item.name, price: price, veg_status: item.veg_status, image: item.image_details?.url });
            }
        },
        handleRemoveFromOrder: () => removeItem(item)
    }), [isInStock, addItem, removeItem, item, price]);

    return (
        <div ref={ref} className="h-full">
            {inView ? (
                <Card style={styles?.cardStyle} className={cn("flex flex-col justify-between overflow-hidden h-full relative", currentView === 'list' && 'flex-row p-3 gap-4')}>
                    {currentView === 'list' ? "" : <div className='absolute top-2 right-2 z-[1]' >
                        <StatusBadge type={item?.veg_status} />
                    </div>}

                    <OptimizedImage src={item?.image_details?.url} alt={item?.name} currentView={currentView === 'list'} />
                    <CardContent className={cn("flex flex-col flex-auto justify-between p-4 px-2", currentView === 'list' && 'p-0')}>
                        <div className="flex flex-col gap-1">
                            <CardTitle style={styles?.titleStyle} className="text-lg text-primary">
                                {item?.name}
                            </CardTitle>
                            <CardDescription style={styles?.descriptionStyle} className="text-secondary line-clamp-2">
                                {item?.description}
                            </CardDescription>
                        </div>
                        <div className="flex sm:flex-row-reverse flex-col justify-between mt-2 gap-1">
                            <div className='flex items-center gap-2' >
                                <StatusBadge type={item?.veg_status} currentView={currentView} />
                                <Separator orientation='vertical' className='bg-gray-400' />
                                <Chip variant="light" color={isInStock ? "green" : "red"} radius="md" size="xs">{isInStock ? "In Stock" : "Out Of Stock"}</Chip>
                            </div>
                            <span style={styles?.titleStyle} className="text-base font-bold">
                                {currencyInfo} {price.toFixed(2)}
                            </span>
                        </div>
                        {/* <div className="flex items-center justify-between mt-2">
                            <span style={styles?.titleStyle} className="text-base font-bold">
                                {currencyInfo} {price.toFixed(2)}
                            </span>
                            {
                                !!itemInOrder ? (
                                    <div className='flex items-center gap-x-1' >
                                        <Button disabled={!isInStock} style={styles?.buttonBackgroundStyle} variant='primary' size='icon' onClick={handlers.handleRemoveFromOrder} className="flex items-center gap-1">
                                            <p style={styles?.buttonLabelStyle} ><Minus size={14} /></p>
                                        </Button>

                                        <Chip className='gap-1 w-8 h-8  bg-white p-0 flex items-center justify-center' variant='outline' radius='md' size='sm' color={'gray'}>
                                            {itemInOrder.quantity}
                                        </Chip>

                                        <Button disabled={!isInStock} style={styles?.buttonBackgroundStyle} variant='primary' size='icon' onClick={handlers.handleAddToOrder} className="flex items-center gap-1">
                                            <p style={styles?.buttonLabelStyle}  ><Plus size={14} /></p>
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        {isInStock ? (
                                            <Chip variant="light" color="green" radius="md" size="xs">{t("In_Stock")}</Chip>
                                        ) : (
                                            <Chip variant="light" color="red" radius="md" size="xs">{t("Out_of_Stock")}</Chip>
                                        )}
                                    </>
                                )
                            }
                        </div> */}
                    </CardContent>
                </Card>
            ) : (
                <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse" />
            )}
        </div>
    );
});

const CategoryAccordion = memo(({ category, globalConfig, currencyInfo, currentView }) => {
    const categoryId = category.id || category.unique_id || category.name;
    const categoryStyle = category?.style || {};

    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: '600px 0px',
        triggerOnce: true,
    });

    const [isLoaded, setIsLoaded] = useState(false);
    const [renderBatch, setRenderBatch] = useState(9); // Progressive loading

    useEffect(() => {
        if (inView && !isLoaded) {
            setIsLoaded(true);
        }
    }, [inView, isLoaded]);

    const styles = useMenuStyles(globalConfig, categoryStyle);

    // Memoize visible items
    const visibleItems = useMemo(() =>
        category?.items?.filter(item => item?.visible) || [],
        [category?.items]
    );

    // Progressive loading for better performance
    const displayedItems = useMemo(() => {
        if (visibleItems.length <= 12) {
            return visibleItems;
        }
        return visibleItems.slice(0, renderBatch);
    }, [visibleItems, renderBatch]);

    // Load more items progressively
    const loadMoreItems = () => {
        if (renderBatch < visibleItems.length) {
            setRenderBatch(prev => Math.min(prev + 6, visibleItems.length));
        }
    };

    // Auto-load more when in view
    useEffect(() => {
        if (inView && renderBatch < visibleItems.length) {
            const timer = setTimeout(loadMoreItems, 1000);
            return () => clearTimeout(timer);
        }
    }, [inView, renderBatch, visibleItems.length]);

    return (
        <Card key={categoryId} value={categoryId} style={styles?.sectionStyle} id={categoryId} ref={ref} className={cn('bg-card md:rounded-md rounded overflow-hidden border-none md:px-3 px-1')}>
            <CardHeader className="py-3 px-2 hover:no-underline">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-1.5 bg-primary rounded-full hidden sm:block" style={styles?.titleBarStyle} />
                    <h2 style={styles?.titleTextStyle} className="text-xl font-semibold">
                        {category?.name}
                    </h2>
                </div>
            </CardHeader>
            <CardContent className="p-2">
                {(inView || isLoaded) ? (
                    <>
                        <div className={cn("grid  gap-4", currentView === 'grid' ? 'lg:grid-cols-3 md:grid-cols-2 grid-cols-1' : 'grid-cols-1')}>
                            {displayedItems.length > 0 ? displayedItems.map(item => (
                                <MenuItem
                                    currencyInfo={currencyInfo}
                                    key={item.unique_id || item.id}
                                    item={item}
                                    currentView={currentView}
                                    styles={{
                                        cardStyle: styles.cardStyle,
                                        titleStyle: styles.titleStyle,
                                        descriptionStyle: styles.descriptionStyle,
                                        buttonBackgroundStyle: styles.buttonBackgroundStyle,
                                        buttonLabelStyle: styles.buttonLabelStyle,
                                    }}
                                />
                            )) : (
                                <p className='flex items-center justify-center h-20 font-semibold text-lg w-full lg:col-span-3 md:col-span-2 col-span-1'>
                                    No Item Available
                                </p>
                            )}
                        </div>

                        {renderBatch < visibleItems.length && (
                            <div className="flex justify-center mt-4">
                                <button onClick={loadMoreItems} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                                    Load More ({visibleItems.length - renderBatch} remaining)
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="h-20 bg-gray-100 animate-pulse rounded-md" />
                )}
            </CardContent>
        </Card>
    );
});

export default function CustomerMenuViewer({ menuConfig, options = {}, clinetInfo }) {

    const { enableImagePreloading = true, preloadOptions = {} } = options;

    const categories = menuConfig?.categories || [];
    const globalFromConfig = menuConfig?.global || {};

    // Add image preloading
    useMenuPreloader(menuConfig, {
        preloadImages: enableImagePreloading,
        batchSize: 5,
        priority: 'visible',
        ...preloadOptions
    });

    const globalConfig = useMemo(() => ({
        background_color: globalFromConfig.background_color,
        section_background_color: globalFromConfig.section_background_color,
        title_color: globalFromConfig.title_color,
        card_title_color: globalFromConfig.card_title_color,
        card_background_color: globalFromConfig.card_background_color,
        description_color: globalFromConfig.description_color,
        button_label_color: globalFromConfig.button_label_color,
        button_background_color: globalFromConfig.button_background_color,
    }), [
        globalFromConfig.background_color,
        globalFromConfig.section_background_color,
        globalFromConfig.title_color,
        globalFromConfig.card_title_color,
        globalFromConfig.card_background_color,
        globalFromConfig.description_color,
        globalFromConfig.button_label_color,
        globalFromConfig.button_background_color
    ]);


    const visibleCategories = useMemo(() =>
        categories.filter(category =>
            category?.visible &&
            category?.items?.filter(item => item?.visible)?.length > 0
        ),
        [categories]
    );


    const containerStyle = useMemo(() =>
        globalConfig?.background_color ?
            { backgroundColor: globalConfig.background_color } : {},
        [globalConfig?.background_color]
    );

    const styles = useMenuStyles(globalConfig, visibleCategories[0]?.style || {});

    return (
        <div className="md:p-4 p-2 bg-gray-100/90 min-h-[100dvh] max-h-[100dvh] overflow-auto space-y-4" style={containerStyle}>

            <Card key={"clinet_info"} value={"clinet_info"} style={styles?.sectionStyle} id={"clinet_info"} className={cn('bg-card md:rounded-md rounded overflow-hidden border-none md:px-3 px-1')}>
                <CardContent className="p-6 md:py-4  py-2">
                    <div className="flex flex-col md:flex-row items-center justify-center md:space-x-6  space-x-0">
                        <div className="flex-shrink-0">
                            <div className={`w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex flex-col items-center justify-center overflow-hidden cursor-default`}>
                                <img src={clinetInfo?.logo_signed_url} alt="Cafe logo preview" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="">
                            <h2 className="text-2xl font-bold md:text-left text-center" style={styles?.titleBarStyle}>
                                {clinetInfo?.cafe_name || 'Your Cafe Name'}
                            </h2>
                            <p className=" mt-1 md:text-left text-center" style={styles?.titleTextStyle}   >
                                Owned by {clinetInfo?.first_name} {clinetInfo?.last_name}
                            </p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-500">
                                {clinetInfo?.cityName && (
                                    <div className="flex items-center gap-1">
                                        <MapPin size={14} />
                                        <span>{clinetInfo?.cityName}</span>
                                    </div>
                                )}
                                {clinetInfo?.cafe_phone && (
                                    <div style={styles.descriptionStyle} className="flex items-center gap-1">
                                        <Phone size={14} />
                                        <span>{clinetInfo?.cafe_phone}</span>
                                    </div>
                                )}
                                {clinetInfo?.cafe_email && (
                                    <div style={styles.descriptionStyle} className="flex items-center gap-1">
                                        <Mail size={14} />
                                        <span>{clinetInfo?.cafe_email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {visibleCategories.map(category => (
                <CategoryAccordion
                    key={category.id || category.unique_id || category.name}
                    globalConfig={globalConfig}
                    category={category}
                    currencyInfo={clinetInfo?.currency_symbol}
                    currentView={menuConfig?.view || "grid"}
                />
            ))}

            {visibleCategories.length === 0 && (
                <div className="flex items-center justify-center h-64">
                    <p className="text-lg text-gray-500">No menu items available</p>
                </div>
            )}
        </div>
    )
}
