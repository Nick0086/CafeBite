import { api, handleApiError } from "@/utils/api";

export const getAllMenuItems = async () => {
    try {
        const response = await api.get('/menu');
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const getMenuItemImageUrl = async (menuItemId) => {
    try {
        const response = await api.get(`/menu/${menuItemId}/image-url`);
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const getUploadUrl = async () => {
    try {
        const response = await api.post('/menu/upload-url');
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const createMenuItem = async (data) => {
    try {
        const response = await api.post('/menu', data);
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const updateMenuItem = async (menuItemId, data) => {
    try {
        const response = await api.put(`/menu/${menuItemId}`, data);
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}