import { api, handleApiError } from "@/utils/api";

export const getAllTemplates = async () => {
    try {
        const response = await api.get('/template');
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}
export const getTemplateById = async (templateId) => {
    try {
        const response = await api.get(`/template/${templateId}`);
        return  response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const createTemplate = async (data) => {
    try {
        const response = await api.post('/template', data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}

export const updateTemplate = async (data) => {
    try {
        const response = await api.put(`/template/${data?.templateId}`, data?.templateData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}
