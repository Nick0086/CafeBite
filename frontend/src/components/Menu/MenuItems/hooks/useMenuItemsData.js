import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMenuItem, getAllMenuItems, getMenuItemImageUrl, updateMenuItem } from '@/service/menuItems.service';
import { getAllCategory } from '@/service/categories.service';
import { categoryQueryKeys } from '../../Categories/constants/category.constants';
import { menuItemQueryKeys } from '../constants/menuItem.constants';

export function useMenuItemList() {
    return useQuery({
        queryKey: [menuItemQueryKeys.ALL],
        queryFn: getAllMenuItems,
    });
}

export function useMenuItemImageUrl(menuItemId, { enabled } = {}) {
    return useQuery({
        queryKey: menuItemQueryKeys.IMAGE_URL(menuItemId),
        queryFn: () => getMenuItemImageUrl(menuItemId),
        staleTime: 23 * 60 * 60 * 1000,
        enabled: enabled ?? !!menuItemId,
    });
}

export function useCategoryOptions() {
    return useQuery({
        queryKey: [categoryQueryKeys.ALL],
        queryFn: getAllCategory,
    });
}

export function useCreateMenuItemMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [menuItemQueryKeys.ALL] });
        },
    });
}

export function useUpdateMenuItemMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ menuItemId, ...data }) => updateMenuItem(menuItemId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [menuItemQueryKeys.ALL] });
        },
    });
}
