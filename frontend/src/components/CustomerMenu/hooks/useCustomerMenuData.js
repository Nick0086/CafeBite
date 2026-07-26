import { useQuery } from "@tanstack/react-query";
import {
    getMenuCategoryForConsumer,
    getMenuForCustomerByTableId,
    getMenuItemsForConsumer,
} from "@/service/customerMenu.service";
import { customerMenuQueryKeys } from "../constants/customerMenu.constants";

export function useCustomerMenuTemplate(userId, tableId) {
    return useQuery({
        queryKey: [customerMenuQueryKeys.TEMPLATE, userId, tableId],
        queryFn: () => getMenuForCustomerByTableId({ userId, tableId }),
    });
}

export function useCustomerMenuCategories(userId) {
    return useQuery({
        queryKey: [customerMenuQueryKeys.CATEGORIES, userId],
        queryFn: () => getMenuCategoryForConsumer(userId),
    });
}

export function useCustomerMenuItems(userId) {
    return useQuery({
        queryKey: [customerMenuQueryKeys.MENU_ITEMS, userId],
        queryFn: () => getMenuItemsForConsumer(userId),
    });
}
