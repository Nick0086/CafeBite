import { authApi, handleApiError } from "@/utils/api";

export const getAllCountry = async () => {
    try {
        const response = await authApi.get('/common/country');
        return response.data;
    } catch (error) {
        throw handleApiError(error)
    }
}

export const getStateByCountry = async (country) => {
    try {
        const response = await authApi.get(`/common/state/${country}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error)
    }
}

export const getCityByState = async (state) => {
    try {
        const response = await authApi.get(`/common/city/${state}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error)
    }
}

export const getAllCurrency = async () => {
    try {
        const response = await authApi.get('/common/currency');
        return response.data;
    } catch (error) {
        throw handleApiError(error)
    }
}