import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    addComment,
    addFeedbackImages,
    createFeedback,
    deleteComment,
    deleteFeedbackImage,
    getClientFeedback,
    getFeedbackById,
    getFeedbackStats,
    updateComment,
    updateFeedback,
    updateFeedbackStatus,
    updateFeedbackType,
} from '@/service/clientFeedback.service';
import { feedbackQueryKeys } from '../constants/clientSupport.constants';

export function useFeedbackList({ page, pageSize }) {
    return useQuery({
        queryKey: [feedbackQueryKeys.LIST, pageSize, page],
        queryFn: () => getClientFeedback({ limit: pageSize, page: page + 1 }),
    });
}

export function useFeedbackDetail(feedbackId, enabled) {
    return useQuery({
        queryKey: [feedbackQueryKeys.DETAIL, feedbackId],
        queryFn: () => getFeedbackById(feedbackId),
        enabled: !!feedbackId && enabled,
    });
}

export function useFeedbackStats() {
    return useQuery({
        queryKey: [feedbackQueryKeys.STATS],
        queryFn: getFeedbackStats,
    });
}

export function useCreateFeedbackMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createFeedback,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [feedbackQueryKeys.LIST] });
        },
    });
}

export function useUpdateFeedbackMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateFeedback,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [feedbackQueryKeys.LIST] });
        },
    });
}

export function useUpdateFeedbackStatusMutation({ page, pageSize }) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateFeedbackStatus,
        onSuccess: (res, variables) => {
            queryClient.setQueryData([feedbackQueryKeys.LIST, pageSize, page], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.map((item) =>
                        item.unique_id === variables.feedbackId
                            ? { ...item, status: variables.status }
                            : item
                    ),
                };
            });
        },
    });
}

export function useUpdateFeedbackTypeMutation({ page, pageSize }) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateFeedbackType,
        onSuccess: (res, variables) => {
            queryClient.setQueryData([feedbackQueryKeys.LIST, pageSize, page], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.map((item) =>
                        item.unique_id === variables.feedbackId
                            ? { ...item, type: variables.type }
                            : item
                    ),
                };
            });
        },
    });
}

export function useAddCommentMutation(feedbackId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => addComment(feedbackId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [feedbackQueryKeys.DETAIL, feedbackId] });
        },
    });
}

export function useUpdateCommentMutation(feedbackId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => updateComment(feedbackId, data.commentId, data.comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [feedbackQueryKeys.DETAIL, feedbackId] });
        },
    });
}

export function useDeleteCommentMutation(feedbackId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentId) => deleteComment(feedbackId, commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [feedbackQueryKeys.DETAIL, feedbackId] });
        },
    });
}

export function useAddFeedbackImagesMutation(feedbackId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => addFeedbackImages(feedbackId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [feedbackQueryKeys.DETAIL, feedbackId] });
        },
    });
}

export function useDeleteFeedbackImageMutation(feedbackId) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (imageId) => deleteFeedbackImage(feedbackId, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [feedbackQueryKeys.DETAIL, feedbackId] });
        },
    });
}
