import { api, handleApiError } from "@/utils/api";

// ========== CLIENT SERVICE FUNCTIONS ==========

export const createFeedback = async (data) => {
    try {
        const response = await api.post('/feedback', data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getClientFeedback = async (params = {}) => {
    try {
        const response = await api.get('/feedback', { params });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getFeedbackStats = async () => {
    try {
        const response = await api.get('/feedback/stats');
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getFeedbackMetadata = async () => {
    try {
        const response = await api.get('/feedback/metadata');
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getFeedbackById = async (feedbackId) => {
    try {
        const response = await api.get(`/feedback/${feedbackId}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateFeedback = async (data) => {
    try {
        const response = await api.put(`/feedback/${data?.feedbackId}`, data?.data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateFeedbackType = async (type) => {
    try {
        const response = await api.put(`/feedback/${type?.feedbackId}/type`, { type: type?.type });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateFeedbackStatus = async (data) => {
    try {
        const response = await api.put(`/feedback/${data?.feedbackId}/status`, data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const addFeedbackImages = async (feedbackId, data) => {
    try {
        const response = await api.post(`/feedback/${feedbackId}/images`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteFeedbackImage = async (feedbackId, imageId) => {
    try {
        const response = await api.delete(`/feedback/${feedbackId}/images/${imageId}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const addComment = async (feedbackId, data) => {
    try {
        const response = await api.post(`/feedback/${feedbackId}/comments`, data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateComment = async (feedbackId, commentId, comment) => {
    try {
        const response = await api.put(`/feedback/${feedbackId}/comments/${commentId}`, { comment });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteComment = async (feedbackId, commentId) => {
    try {
        const response = await api.delete(`/feedback/${feedbackId}/comments/${commentId}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// ========== ADMIN SERVICE FUNCTIONS ==========

export const getAllFeedback = async (params = {}) => {
    try {
        const response = await api.get('/feedback/admin', { params });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getAdminFeedbackStats = async (params = {}) => {
    try {
        const response = await api.get('/feedback/admin/stats', { params });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const getAdminFeedbackById = async (feedbackId) => {
    try {
        const response = await api.get(`/feedback/admin/${feedbackId}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateFeedbackStatusAdmin = async (feedbackId, data) => {
    try {
        const response = await api.put(`/feedback/admin/${feedbackId}/status`, data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const assignFeedbackToAdmin = async (feedbackId, adminId) => {
    try {
        const response = await api.put(`/feedback/admin/${feedbackId}/assign`, { admin_id: adminId });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const addAdminComment = async (feedbackId, data) => {
    try {
        const response = await api.post(`/feedback/admin/${feedbackId}/comments`, data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateAdminComment = async (feedbackId, commentId, data) => {
    try {
        const response = await api.put(`/feedback/admin/${feedbackId}/comments/${commentId}`, data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteAdminComment = async (feedbackId, commentId, adminId) => {
    try {
        const response = await api.delete(`/feedback/admin/${feedbackId}/comments/${commentId}`, {
            data: { admin_id: adminId }
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const addAdminFeedbackImages = async (feedbackId, data) => {
    try {
        const response = await api.post(`/feedback/admin/${feedbackId}/images`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};