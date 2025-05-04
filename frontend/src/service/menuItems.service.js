import { api, handleApiError } from "@/utils/api";

export const getAllMenuItems = async () => {
    try {
        const response = await api.get('/menu');
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const createMenuItem = async (data) => {
    try {
        const response = await api.post('/menu', data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data
    } catch (error) {
        throw handleApiError(error);
    }
}

export const updateMenuItem = async (data) => {
    try {
        const response = await api.put(`/menu/${data?.menuItemId}`, data?.menuData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response?.data
    } catch (error) {
        throw handleApiError(error);
    }
}