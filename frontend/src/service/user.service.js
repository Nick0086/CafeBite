import { api, authApi, handleApiError } from "@/utils/api";

export const registerUser = async (userData) => {
    try {
        const response = await authApi.post('/client/register', userData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error)
    }
}

export const updateClinetProfile = async (userData) => {
    try {
        const response = await api.put('/client/update-client-profile', userData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error)
    }
}

export const getClientData = async () => {
    try {
        const response = await api.get('/client');
        return response.data;
    } catch (error) {
        throw handleApiError(error)
    }
}