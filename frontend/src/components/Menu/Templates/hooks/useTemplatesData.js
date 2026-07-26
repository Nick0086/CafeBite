import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createTemplate,
    getAllTemplates,
    getTemplateById,
    updateTemplate,
} from '@/service/templates.service';
import { templateQueryKeys } from '../constants/template.constants';

export function useTemplateList() {
    return useQuery({
        queryKey: [templateQueryKeys.LIST],
        queryFn: getAllTemplates,
    });
}

export function useTemplateById(templateId) {
    return useQuery({
        queryKey: [templateQueryKeys.LIST, templateId],
        queryFn: () => getTemplateById(templateId),
        enabled: !!templateId,
    });
}

export function useCreateTemplateMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [templateQueryKeys.LIST] });
        },
    });
}

export function useUpdateTemplateMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [templateQueryKeys.LIST] });
        },
    });
}
