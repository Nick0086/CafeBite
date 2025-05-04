import { api, handleApiError } from "@/utils/api";

export const getAllCategory = async () => {
    try {
        const response = await api.get('/category');
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}

export const createCategory = async (data) => {
    try {
        const response = await api.post('/category', data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}

export const updateCategory = async (data) => {
    try {
        const response = await api.put(`/category/${data?.categoryId}`, data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}