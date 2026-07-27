import { memo, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VegStatusBadge } from '@/common/StatusBadge';
import { cn } from '@/lib/utils';
import { useOrder } from '@/contexts/OrderManagementContext';
import { useMenuPreloader } from '@/hooks/useMenuPreloader';
import { MapPin, Phone, Mail, Plus, Minus } from 'lucide-react';
import { useMenuStyles } from './menuStyles';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import {
    DEFAULT_INITIAL_RENDER_BATCH,
    RENDER_BATCH_INCREMENT,
    RENDER_BATCH_MAX,
} from '../constants/customerMenu.constants';

const MenuItem = memo(({ item, styles, currencySymbol }) => {
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true,
        rootMargin: '300px 0px',
    });

    const { addItem, removeItem, orderItems } = useOrder();

    const { isInStock, itemInOrder, price } = useMemo(() => ({
        isInStock: item.availability === 'in_stock',
        itemInOrder: orderItems.find(
            (orderItem) => orderItem.id === item.id || orderItem.unique_id === item.unique_id,
        ),
        price: parseFloat(item.price),
    }), [item.availability, item.id, item.unique_id, item.price, orderItems]);

    const handleAdd = () => {
        if (!isInStock) return;
        addItem({
            id: item.id,
            unique_id: item.unique_id,
            name: item.name,
            price: item.price,
            category_id: item.category_id,
            image_details: item.image_details,
        });
    };

    const handleRemove = () => {
        removeItem(item.id || item.unique_id);
    };

    const itemInStock = item.availability !== 'out_of_stock';
    const quantity = itemInOrder?.quantity || 0;

    return (
        <div ref={ref} className="px-2 pb-0.5">
            {inView ? (
                <Card className="overflow-hidden border border-border">
                    <CardContent className="p-0">
                        <div className="flex flex-row items-start gap-3 p-3">
                            {item.image_details?.url && (
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                        <LazyLoadImage
                                            alt={item?.name}
                                            height={item?.image_url ? 90 : 48}
                                            src={item?.image_url || '/placeholder.svg'}
                                            width={item?.image_url ? 90 : 48}
                                            className={`rounded-lg ${item?.image_url ? 'size-[90px] object-cover' : 'size-12'}`}
                                        />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <VegStatusBadge type={item?.is_veg} />
                                            <h4 className="font-medium text-sm leading-tight truncate">
                                                {item.name}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                            {item.description}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                        <span className="font-semibold text-sm whitespace-nowrap">
                                            {currencySymbol} {price.toFixed(2)}
                                        </span>
                                        {!itemInStock ? (
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                Out of stock
                                            </Badge>
                                        ) : quantity > 0 ? (
                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="h-7 w-7"
                                                    onClick={handleRemove}
                                                >
                                                    <Minus size={12} />
                                                </Button>
                                                <span className="text-sm font-medium w-5 text-center">
                                                    {quantity}
                                                </span>
                                                <Button
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={handleAdd}
                                                >
                                                    <Plus size={12} />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                disabled={!isInStock}
                                                style={styles?.buttonBackgroundStyle}
                                                variant="primary"
                                                size="icon"
                                                onClick={handleAdd}
                                            >
                                                <Plus size={14} style={styles?.buttonLabelStyle} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="w-full h-96 bg-gray-100 rounded-lg animate-pulse" />
            )}
        </div>
    );
});
MenuItem.displayName = 'MenuItem';

const CategoryAccordion = memo(({ category, globalConfig, currencySymbol, currentView }) => {
    const categoryId = category.id || category.unique_id || category.name;
    const categoryStyle = category?.style || {};

    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: '600px 0px',
        triggerOnce: true,
    });

    const [renderBatch, setRenderBatch] = useState(DEFAULT_INITIAL_RENDER_BATCH);

    useEffect(() => {
        if (inView) {
            const timer = setTimeout(() => {
                setRenderBatch((prev) => prev + RENDER_BATCH_INCREMENT);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [inView]);

    const styles = useMenuStyles(globalConfig, categoryStyle);

    const visibleItems = useMemo(
        () => category?.items?.filter((item) => item?.visible) || [],
        [category?.items],
    );

    const displayedItems = visibleItems.length <= RENDER_BATCH_MAX
        ? visibleItems
        : visibleItems.slice(0, renderBatch);

    return (
        <Card
            style={styles?.sectionStyle}
            id={categoryId}
            ref={ref}
            className="bg-card md:rounded-md rounded overflow-hidden border-none md:px-3 px-1"
        >
            <CardHeader className="py-3 px-2 hover:no-underline">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-1.5 bg-primary rounded-full" style={styles?.titleBarStyle} />
                    <h2 style={styles?.titleTextStyle} className="text-xl font-semibold">
                        {category?.name}
                    </h2>
                </div>
            </CardHeader>
            <CardContent className="p-2">
                <div className={cn(
                    'grid gap-4',
                    currentView === 'grid' ? 'lg:grid-cols-3 md:grid-cols-2 grid-cols-1' : 'grid-cols-1',
                )}>
                    {displayedItems.length > 0 ? displayedItems.map((item) => (
                        <MenuItem
                            key={item.unique_id || item.id}
                            item={item}
                            currentView={currentView}
                            currencySymbol={currencySymbol}
                            styles={{
                                cardStyle: styles.cardStyle,
                                titleStyle: styles.titleStyle,
                                descriptionStyle: styles.descriptionStyle,
                                buttonBackgroundStyle: styles.buttonBackgroundStyle,
                                buttonLabelStyle: styles.buttonLabelStyle,
                            }}
                        />
                    )) : (
                        <p className="flex items-center justify-center h-20 font-semibold text-lg w-full lg:col-span-3 md:col-span-2 col-span-1">
                            No Item Available
                        </p>
                    )}
                </div>

                {renderBatch < visibleItems.length && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setRenderBatch((prev) => Math.min(prev + RENDER_BATCH_INCREMENT, visibleItems.length))}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                        >
                            Load More ({visibleItems.length - renderBatch} remaining)
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
CategoryAccordion.displayName = 'CategoryAccordion';

export default function CustomerMenuViewer({ menuConfig, options = {}, clinetInfo }) {
    const { enableImagePreloading = true, preloadOptions = {} } = options;

    const categories = useMemo(() => menuConfig?.categories || [], [menuConfig?.categories]);
    const globalFromConfig = menuConfig?.global || {};

    useMenuPreloader(menuConfig, {
        preloadImages: enableImagePreloading,
        batchSize: 5,
        priority: 'visible',
        ...preloadOptions,
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
        globalFromConfig.button_background_color,
    ]);

    const visibleCategories = useMemo(
        () => categories.filter(
            (category) => category?.visible && category?.items?.filter((item) => item?.visible)?.length > 0,
        ),
        [categories],
    );

    const containerStyle = useMemo(
        () => globalConfig?.background_color ? { backgroundColor: globalConfig.background_color } : {},
        [globalConfig?.background_color],
    );

    const styles = useMenuStyles(globalConfig, visibleCategories[0]?.style || {});
    const currencySymbol = clinetInfo?.currency_symbol || '';

    return (
        <div
            className="md:p-4 p-2 bg-gray-100/90 min-h-[100dvh] max-h-[100dvh] overflow-auto space-y-4"
            style={containerStyle}
        >
            <Card
                value="clinet_info"
                style={styles?.sectionStyle}
                id="clinet_info"
                className="bg-card md:rounded-md rounded overflow-hidden border-none md:px-3 px-1"
            >
                <CardContent className="p-6 md:py-4 py-2">
                    <div className="flex flex-col md:flex-row items-center justify-center md:space-x-6 space-x-0">
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex flex-col items-center justify-center overflow-hidden cursor-default">
                                <img
                                    src={clinetInfo?.logo_signed_url}
                                    alt="Cafe logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold md:text-left text-center" style={styles?.titleBarStyle}>
                                {clinetInfo?.cafe_name || 'Your Cafe Name'}
                            </h2>
                            <p className="mt-1 md:text-left text-center" style={styles?.titleTextStyle}>
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

            {visibleCategories.map((category) => (
                <CategoryAccordion
                    key={category.id || category.unique_id || category.name}
                    globalConfig={globalConfig}
                    category={category}
                    currencySymbol={currencySymbol}
                    currentView={menuConfig?.view || 'grid'}
                />
            ))}

            {visibleCategories.length === 0 && (
                <div className="flex items-center justify-center h-64">
                    <p className="text-lg text-gray-500">No menu items available</p>
                </div>
            )}
        </div>
    );
}
