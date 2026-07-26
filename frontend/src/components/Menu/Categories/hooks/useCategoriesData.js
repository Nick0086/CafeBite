import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCategory, getAllCategory, updateCategory } from '@/service/categories.service';
import { categoryQueryKeys } from '../constants/category.constants';

export function useCategoryList() {
    return useQuery({
        queryKey: [categoryQueryKeys.ALL],
        queryFn: getAllCategory,
    });
}

export function useCreateCategoryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [categoryQueryKeys.ALL] });
        },
    });
}

export function useUpdateCategoryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [categoryQueryKeys.ALL] });
        },
    });
}
