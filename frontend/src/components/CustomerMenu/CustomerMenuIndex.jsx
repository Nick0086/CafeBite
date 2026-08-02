import { useMemo } from 'react';
import { useParams } from 'react-router';
import { OrderProvider } from '@/contexts/OrderManagementContext';
import { ErrorState } from '@/components/ui/error';
import SlackLoader from '@/components/ui/CustomLoaders/SlackLoader';
import { DEFAULT_SECTION_THEME } from '@/components/Menu/Templates/constants/template.constants';
import CustomerMenuViewer from './components/CustomerMenuViewer';
import { OrderDrawer } from './components/OrderDrawer';
import { DEFAULT_MENU_OPTIONS } from './constants/customerMenu.constants';
import {
    useCustomerMenuCategories,
    useCustomerMenuItems,
    useCustomerMenuTemplate,
} from './hooks/useCustomerMenuData';
import { visibleHandler } from './components/menuStyles';

export default function CustomerMenuIndex() {
    const { restaurantId, tableId } = useParams();
    const userId = restaurantId;

    const { data: templateData, isLoading: isLoadingTemplate, error: templateError } =
        useCustomerMenuTemplate(userId, tableId);
    const { data: categoryData, isLoading: isLoadingCategories, error: categoryError } =
        useCustomerMenuCategories(userId);
    const { data: menuItemsData, isLoading: isLoadingMenuItems, error: menuItemsError } =
        useCustomerMenuItems(userId);

    const menuTemplate = templateData?.menuTemplate;
    const clinetInfo = templateData?.clinetInfo || {};

    const menuItemsByCategory = useMemo(() => {
        if (!menuItemsData?.menuItems) return {};

        const configCategories = menuTemplate?.config?.categories || [];
        const existingItemsByCategory = configCategories.reduce((acc, category) => {
            acc[category.unique_id] = category.items || [];
            return acc;
        }, {});

        const allItemsByCategory = menuItemsData.menuItems.reduce((acc, item) => {
            const categoryId = item.category_id || 'Uncategorized';
            if (item.status == 1 && item.availability !== 'out_of_stock') {
                if (!acc[categoryId]) acc[categoryId] = [];
                acc[categoryId].push({ ...item, visible: true });
            }
            return acc;
        }, {});

        return Object.entries(allItemsByCategory).reduce((result, [categoryId, items]) => {
            const allMenuItems = items.reduce((acc, element) => {
                acc[element.unique_id] = element;
                return acc;
            }, {});
            const existingItems =
                existingItemsByCategory?.[categoryId]
                    ?.filter((item) => !!allMenuItems?.[item.unique_id])
                    ?.map((item) => ({ ...allMenuItems[item.unique_id], visible: item?.visible })) || [];
            const existingItemIds = new Set(existingItems.map((item) => item.unique_id));
            const newItems = items.filter((item) => !existingItemIds.has(item.unique_id));
            result[categoryId] = [...existingItems, ...newItems];
            return result;
        }, {});
    }, [menuItemsData, menuTemplate]);

    const processedCategories = useMemo(() => {
        if (!categoryData?.categories) return [];

        const allCategories = categoryData.categories.filter((category) => category.status);
        const existingCategoriesVisible = allCategories.reduce((acc, element) => {
            acc[element.unique_id] = element;
            return acc;
        }, {});

        const existingCategories =
            templateData?.menuTemplate?.config?.categories?.map((category) => ({
                ...existingCategoriesVisible[category.unique_id],
                visible: category?.visible,
                style: category?.style,
            })) || [];
        const existingCategoryIds = new Set(existingCategories.map((category) => category.unique_id));
        const newCategories = allCategories.filter((category) => !existingCategoryIds.has(category.unique_id));
        const combinedCategories = [...existingCategories, ...newCategories];

        return combinedCategories.map((category) => ({
            unique_id: category.unique_id,
            name: category.name,
            status: category.status,
            visible: visibleHandler(category.visible),
            style: category.style || DEFAULT_SECTION_THEME,
            items: menuItemsByCategory[category.unique_id] || [],
        }));
    }, [categoryData, menuItemsByCategory, templateData?.menuTemplate?.config?.categories]);

    const derivedTemplateConfig = useMemo(() => {
        if (!menuTemplate) return {};
        return {
            user_id: menuTemplate.user_id,
            unique_id: menuTemplate.unique_id,
            name: menuTemplate.name,
            global: menuTemplate.config?.global,
            styling: menuTemplate.config?.styling,
            view: menuTemplate?.config?.view,
            categories: processedCategories,
        };
    }, [menuTemplate, processedCategories]);

    const isLoading = isLoadingTemplate || isLoadingCategories || isLoadingMenuItems;
    const hasError = templateError || categoryError || menuItemsError;

    if (!userId || !tableId) {
        return (
            <div className="flex items-center justify-center h-[100dvh]">
                <ErrorState />
            </div>
        );
    }

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
        <div className="relative">
            <CustomerMenuViewer
                menuConfig={derivedTemplateConfig}
                options={DEFAULT_MENU_OPTIONS}
                clinetInfo={clinetInfo}
            />
        </div>
    );
}
