import { memo, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Separator } from '@/components/ui/separator';
import { CachedImage } from '@/components/ui/CachedImage';
import { VegStatusBadge } from '@/common/StatusBadge';
import { cn } from '@/lib/utils';
import { useMenuPreloader } from '@/hooks/useMenuPreloader';
import { MapPin, Phone, Mail, Plus, Minus, Search } from 'lucide-react';
import { useMenuStyles } from './menuStyles';
import { useMenuItemImageUrl } from '@/components/Menu/MenuItems/hooks/useMenuItemsData';
import CustomerMenuFilterBar from './CustomerMenuFilterBar';
import {
    DEFAULT_INITIAL_RENDER_BATCH,
    RENDER_BATCH_INCREMENT,
    RENDER_BATCH_MAX,
} from '../constants/customerMenu.constants';

const OptimizedImage = memo(({ item, alt, currentView }) => {
    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: '150px',
        triggerOnce: true,
    });
    const hasImage = !!(item?.image_details?.path);
    const { data: imageData, isLoading } = useMenuItemImageUrl(item?.unique_id, { enabled: hasImage && inView });
    const imageUrl = imageData?.imageUrl;

    return (
        <div ref={ref} className={cn("rounded-lg overflow-hidden shrink-0 relative", currentView ? 'w-[124px] min-w-[124px] h-[100px]' : 'w-full h-64')}>
            <div className="absolute top-1.5 right-1.5 z-10 bg-white/95 backdrop-blur-xs rounded-md shadow-sm p-0.5">
                <VegStatusBadge type={item?.veg_status} />
            </div>
            {!hasImage ? (
                <div className={cn("bg-gray-200 rounded-lg flex items-center justify-center", currentView ? 'w-[124px] h-[100px]' : 'w-full h-64')}>
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            ) : isLoading || !imageUrl ? (
                <div className="bg-gray-200 rounded-lg flex items-center justify-center animate-pulse" style={{ width: currentView ? '124px' : '100%', height: currentView ? '100px' : '256px' }}>
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            ) : (
                <CachedImage
                    src={imageUrl}
                    alt={alt || 'Menu item'}
                    className="object-cover"
                    currentView={currentView}
                    quality={0.8}
                    lazy={false}
                    placeholder={true}
                    showCacheStatus={false}
                />
            )}
        </div>
    );
});
OptimizedImage.displayName = 'OptimizedImage';

const MenuItem = memo(({ item, styles, currencySymbol, currentView }) => {
    MenuItem.displayName = 'MenuItem';
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: false,
        rootMargin: '100px 0px',
    });

    useEffect(() => {
        if (inView && !hasBeenVisible) setHasBeenVisible(true);
    }, [inView, hasBeenVisible]);

    const cardStyle = styles?.cardStyle || {};
    const titleStyle = styles?.titleStyle || {};
    const descriptionStyle = styles?.descriptionStyle || {};

    return (
        <div ref={ref} className="h-full">
            {(inView || hasBeenVisible) ? (
                <Card style={cardStyle} className={cn("flex flex-col justify-between overflow-hidden h-full relative", currentView === 'list' && 'flex-row p-3 gap-4')}>
                    <OptimizedImage item={item} alt={item?.name} currentView={currentView === 'list'} />
                    <CardContent className={cn("flex flex-col flex-auto justify-between p-4 px-2", currentView === 'list' && 'p-0 min-w-0')}>
                        <div className="flex flex-col gap-1">
                            <CardTitle style={titleStyle} className="md:text-lg text-base text-primary flex items-center gap-2">
                                {item?.name}
                            </CardTitle>
                            <CardDescription style={descriptionStyle} className="text-secondary md:text-sm text-xs">
                                {item?.description}
                            </CardDescription>
                        </div>
                        <div className="flex flex-row flex-wrap justify-between items-center mt-2 gap-2">
                            <span style={titleStyle} className="text-base font-bold whitespace-nowrap">
                                {currencySymbol} {item?.price}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse" />
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

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFoodTypes, setSelectedFoodTypes] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const visibleCategories = useMemo(
        () => categories.filter(
            (category) => category?.visible && category?.items?.filter((item) => item?.visible)?.length > 0,
        ),
        [categories],
    );

    const filteredCategories = useMemo(() => {
        return visibleCategories
            .filter((category) => {
                const catId = category.id || category.unique_id;
                if (selectedCategories.length > 0) {
                    return selectedCategories.includes(catId);
                }
                return true;
            })
            .map((category) => {
                const filteredItems = (category?.items || []).filter((item) => {
                    if (!item?.visible) return false;

                    if (searchQuery.trim() !== '') {
                        const q = searchQuery.toLowerCase().trim();
                        const matchesName = item?.name?.toLowerCase().includes(q);
                        const matchesDesc = item?.description?.toLowerCase().includes(q);
                        if (!matchesName && !matchesDesc) return false;
                    }

                    if (selectedFoodTypes.length > 0) {
                        const status = item?.veg_status || 'veg';
                        if (!selectedFoodTypes.includes(status)) return false;
                    }

                    return true;
                });

                return {
                    ...category,
                    items: filteredItems,
                };
            })
            .filter((category) => category.items.length > 0);
    }, [visibleCategories, selectedCategories, searchQuery, selectedFoodTypes]);

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
                className="bg-card md:rounded-md rounded-xl overflow-hidden border-none shadow-xs"
            >
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-start text-center md:text-left gap-4 md:gap-6">
                        {clinetInfo?.logo_signed_url && (
                            <div className="shrink-0">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden cursor-default">
                                    <img
                                        src={clinetInfo?.logo_signed_url}
                                        alt={clinetInfo?.cafe_name || 'Cafe logo'}
                                        className="w-full h-full object-contain p-1"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h2
                                className="text-xl sm:text-2xl font-extrabold tracking-tight text-center md:text-left"
                                style={styles?.titleTextStyle}
                            >
                                {clinetInfo?.cafe_name || 'Your Cafe Name'}
                            </h2>
                            
                            {(clinetInfo?.first_name || clinetInfo?.last_name) && (
                                <p
                                    className="mt-1 text-xs sm:text-sm font-medium opacity-85 text-center md:text-left"
                                    style={styles?.descriptionStyle}
                                >
                                    Owned by {[clinetInfo?.first_name, clinetInfo?.last_name].filter(Boolean).join(' ')}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 mt-3 text-xs sm:text-sm">
                                {clinetInfo?.cityName && (
                                    <div
                                        style={styles?.descriptionStyle}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/70 dark:bg-slate-800/50 md:bg-transparent md:px-0 md:py-0 max-w-full"
                                    >
                                        <MapPin size={14} className="shrink-0 opacity-80" />
                                        <span className="truncate">{clinetInfo?.cityName}</span>
                                    </div>
                                )}
                                {clinetInfo?.cafe_phone && (
                                    <div
                                        style={styles?.descriptionStyle}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/70 dark:bg-slate-800/50 md:bg-transparent md:px-0 md:py-0 max-w-full"
                                    >
                                        <Phone size={14} className="shrink-0 opacity-80" />
                                        <span className="break-all">{clinetInfo?.cafe_phone}</span>
                                    </div>
                                )}
                                {clinetInfo?.cafe_email && (
                                    <div
                                        style={styles?.descriptionStyle}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/70 dark:bg-slate-800/50 md:bg-transparent md:px-0 md:py-0 max-w-full"
                                    >
                                        <Mail size={14} className="shrink-0 opacity-80" />
                                        <span className="break-all">{clinetInfo?.cafe_email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {visibleCategories.length > 0 && (
                <CustomerMenuFilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedFoodTypes={selectedFoodTypes}
                    onFoodTypeChange={setSelectedFoodTypes}
                    selectedCategories={selectedCategories}
                    onCategoryChange={setSelectedCategories}
                    categories={visibleCategories}
                    styles={styles}
                />
            )}

            {filteredCategories.map((category) => (
                <CategoryAccordion
                    key={category.id || category.unique_id || category.name}
                    globalConfig={globalConfig}
                    category={category}
                    currencySymbol={currencySymbol}
                    currentView={menuConfig?.view || 'grid'}
                />
            ))}

            {visibleCategories.length > 0 && filteredCategories.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-xl border border-slate-200 shadow-xs my-6">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <Search size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No food items match your filter</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Try clearing your search query or removing dietary and category filters.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedFoodTypes([]);
                            setSelectedCategories([]);
                        }}
                        style={styles?.buttonBackgroundStyle}
                        className="mt-4 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs shadow-xs transition-all"
                    >
                        Reset All Filters
                    </button>
                </div>
            )}

            {visibleCategories.length === 0 && (
                <div className="flex items-center justify-center h-64">
                    <p className="text-lg text-gray-500">No menu items available</p>
                </div>
            )}
        </div>
    );
}
