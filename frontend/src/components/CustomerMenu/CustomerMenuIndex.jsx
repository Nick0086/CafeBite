import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import {
    getMenuCategoryForConsumer,
    getMenuForCustomerByTableId,
    getMenuItemsForConsumer,
} from '@/service/customer-menu.service';
import { customerMenuQueryKeyLoopUp, visibleHandler } from './utils';
import { toastError } from '@/utils/toast-utils';
import { ErrorState } from '../ui/error';
import SlackLoader from '../ui/CustomLoaders/SlackLoader';
import { DEFAULT_SECTION_THEME } from '../Menu/Templates/utils';
import CustomerMenuViewer from './CustomerMenuViewer';
import { OrderHistoryProvider, OrderProvider } from '@/contexts/order-management-context';
import { OrderDrawer } from './OrderDrawer';
import { CacheDebugger } from '@/utils/cacheDebugger';

export default function CustomerMenuIndex() {
    const { restaurantId, tableId } = useParams();

    // Debug cache stats in development
    // useEffect(() => {
    //     if (process.env.NODE_ENV === 'development') {
    //         const timer = setTimeout(() => {
    //             CacheDebugger.logCacheStats();
    //         }, 2000);
    //         return () => clearTimeout(timer);
    //     }
    // }, []);

    // Fetch the menu template for the current table and restaurant.
    const { data: templateData, isLoading: isLoadingTemplate, error: templateError } = useQuery({
        queryKey: [customerMenuQueryKeyLoopUp['TEMPLATE'], restaurantId, tableId],
        queryFn: () => getMenuForCustomerByTableId({ tableId: restaurantId, userId: tableId })
    });

    // Fetch categories and menu items.
    const { data: categoryData, isLoading: isLoadingCategories, error: categoryError, } = useQuery({
        queryKey: [customerMenuQueryKeyLoopUp['MENU_ITEMS'], restaurantId],
        queryFn: () => getMenuCategoryForConsumer(restaurantId)
    });

    const { data: menuItemsData, isLoading: isLoadingMenuItems, error: menuItemsError, } = useQuery({
        queryKey: [customerMenuQueryKeyLoopUp['CATEGORY'], restaurantId],
        queryFn: () => getMenuItemsForConsumer(restaurantId)
    });

    // Centralized error handling with toasts.
    useEffect(() => {
        if (templateError) {
            toastError(`Error fetching menu template: ${JSON.stringify(templateError)}`);
        }
        if (categoryError) {
            toastError(`Error fetching category list: ${JSON.stringify(categoryError)}`);
        }
        if (menuItemsError) {
            toastError(`Error fetching menu items: ${JSON.stringify(menuItemsError)}`);
        }
    }, [templateError, categoryError, menuItemsError]);

    const menuTemplate = templateData?.menuTemplate;
    const clinetInfo = templateData?.clinetInfo || {};

    // Build a mapping of menu items grouped by category.
    const menuItemsByCategory = useMemo(() => {
        if (!menuItemsData?.menuItems) return {};

        // Build a map of items already defined in the template configuration.
        const configCategories = menuTemplate?.config?.categories || [];
        const existingItemsByCategory = configCategories.reduce((acc, category) => {
            acc[category.unique_id] = category.items || [];
            return acc;
        }, {});

        // Group all fetched menu items by category and include only active items.
        const allItemsByCategory = menuItemsData?.menuItems.reduce((acc, item) => {
            const categoryId = item.category_id || 'Uncategorized';
            if (item.status) {
                if (!acc[categoryId]) acc[categoryId] = [];
                acc[categoryId].push({ ...item, visible: true });
            }
            return acc;
        }, {});

        // Merge items from the template config with new items, avoiding duplicates.
        return Object.entries(allItemsByCategory).reduce((result, [categoryId, items]) => {
            const allMenuItems = items?.reduce((acc, element) => {
                acc[element.unique_id] = element;
                return acc;
            }, {});
            const existingItems = existingItemsByCategory?.[categoryId]?.map(item => ({ ...allMenuItems[item.unique_id], visible: item?.visible })) || [];
            const existingItemIds = new Set(existingItems.map(item => item.unique_id));
            const newItems = items.filter(item => !existingItemIds.has(item.unique_id));
            result[categoryId] = [...existingItems, ...newItems];
            return result;
        }, {});
    }, [menuItemsData, menuTemplate]);

    // Process and combine categories from fetched data and template configuration.
    const processedCategories = useMemo(() => {
        if (!categoryData?.categories) return [];

        const allCategories = categoryData?.categories.filter(category => category.status);
        const existingCategoriesVisible = allCategories?.reduce((acc, element) => {
            acc[element.unique_id] = element;
            return acc;
        }, {});

        const existingCategories = templateData?.menuTemplate?.config?.categories?.map(category => ({ ...existingCategoriesVisible[category.unique_id], visible: category?.visible, style: category?.style })) || [];
        const existingCategoryIds = new Set(existingCategories.map(category => category.unique_id));
        const newCategories = allCategories.filter(category => !existingCategoryIds.has(category.unique_id));
        const combinedCategories = [...existingCategories, ...newCategories];


        return combinedCategories.map((category) => ({
            unique_id: category.unique_id,
            name: category.name,
            status: category.status,
            visible: visibleHandler(category.visible),
            style: category.style || DEFAULT_SECTION_THEME,
            items: menuItemsByCategory[category.unique_id] || [],
        }));
    }, [categoryData, menuItemsByCategory, menuTemplate]);

    // Derive a complete menu template configuration for rendering.
    const derivedTemplateConfig = useMemo(() => {
        if (!menuTemplate) return {};
        return {
            user_id: menuTemplate.user_id,
            unique_id: menuTemplate.unique_id,
            name: menuTemplate.name,
            global: menuTemplate.config?.global,
            styling: menuTemplate.config?.styling,
            categories: processedCategories,
        };
    }, [menuTemplate, processedCategories]);

    const menuOptions = {
        enableVirtualization: true, // Enable for large menus (>50 items per category)
        enableImagePreloading: true,
        enablePerformanceMonitoring: process.env.NODE_ENV === 'development',

        virtualConfig: {
            containerHeight: 600,
            itemWidth: 320,
            itemHeight: 420,
            columnCount: 3
        },

        preloadOptions: {
            batchSize: 8,
            priority: 'visible' // 'visible', 'all', 'none'
        }
    };

    // Combine all loading states.
    const isLoading = isLoadingTemplate || isLoadingCategories || isLoadingMenuItems;
    const hasError = templateError || categoryError || menuItemsError;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[100dvh]">
                <SlackLoader />
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="flex items-center justify-center h-[100dvh]">
                <ErrorState />
            </div>
        );
    }

    return (
        <OrderProvider>
            <div className="relative">
                <CustomerMenuViewer menuConfig={derivedTemplateConfig} options={menuOptions}/>
                {/* <OrderHistoryProvider restaurantId={restaurantId} tableId={tableId} >
                    <OrderDrawer />
                </OrderHistoryProvider> */}
            </div>
        </OrderProvider>
    )
}
