import { api, authApi, handleApiError } from "@/utils/api";


const TOKEN_KEYS = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
    userData: 'userData',
};

export const tokenStore = {
    set({ accessToken, refreshToken, userData }) {
        if (accessToken) localStorage.setItem(TOKEN_KEYS.accessToken, accessToken);
        if (refreshToken) localStorage.setItem(TOKEN_KEYS.refreshToken, refreshToken);
        if (userData) localStorage.setItem(TOKEN_KEYS.userData, JSON.stringify(userData));
    },
    clear() {
        localStorage.removeItem(TOKEN_KEYS.accessToken);
        localStorage.removeItem(TOKEN_KEYS.refreshToken);
        localStorage.removeItem(TOKEN_KEYS.userData);
    },
    getUserData() {
        try {
            return JSON.parse(localStorage.getItem(TOKEN_KEYS.userData) || '{}');
        } catch {
            return {};
        }
    },
};

export const checkUserExists = async (userData) => {
    try {
        const response = await authApi.post('/auth/user/check', userData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const verifyUserPassword = async (userData) => {
    try {
        const response = await authApi.post('/auth/user/verify-password', userData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const verifyOneTimePassword = async (userData) => {
    try {
        const response = await authApi.post('/auth/user/verify-otp', userData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const sendOneTimePassword = async (userData) => {
    try {
        const response = await authApi.post('/auth/user/send-otp', userData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const checkUserSession = async () => {
    try {
        const response = await authApi.get('/auth/session/active');
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const requestPasswordReset = async (userData) => {
    const identifier = typeof userData === 'string' ? userData : userData?.email || userData?.phone || userData?.userId;
    if (!identifier) throw handleApiError(new Error('Email or phone is required'));
    try {
        const response = await authApi.get(`/auth/password/forgot/${identifier}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const performPasswordReset = async (userData) => {
    try {
        const response = await authApi.post('/auth/password/reset', userData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const validateResetToken = async (token) => {
    try {
        const response = await authApi.get(`/auth/password/check-reset-token/${token}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const logoutUser = async () => {
    try {
        const response = await api.get('/auth/session/logout');
        tokenStore.clear();
        return response.data;
    } catch (error) {
        tokenStore.clear();
        throw handleApiError(error);
    }
};
