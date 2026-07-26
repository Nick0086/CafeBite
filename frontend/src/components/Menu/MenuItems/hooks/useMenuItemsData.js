import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMenuItem, getAllMenuItems, updateMenuItem } from '@/service/menuItems.service';
import { getAllCategory } from '@/service/categories.service';
import { categoryQueryKeys } from '../../Categories/constants/category.constants';
import { menuItemQueryKeys } from '../constants/menuItem.constants';

export function useMenuItemList() {
    return useQuery({
        queryKey: [menuItemQueryKeys.ALL],
        queryFn: getAllMenuItems,
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
        mutationFn: updateMenuItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [menuItemQueryKeys.ALL] });
        },
    });
}
