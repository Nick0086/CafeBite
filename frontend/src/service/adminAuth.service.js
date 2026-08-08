import { adminApi, authApi, handleApiError } from '@/utils/api';

const ADMIN_TOKEN_KEY = 'adminAccessToken';
const ADMIN_USER_KEY = 'adminUserData';

export const adminTokenStore = {
    getAccessToken() {
        return localStorage.getItem(ADMIN_TOKEN_KEY);
    },
    set({ adminAccessToken, admin }) {
        if (adminAccessToken) localStorage.setItem(ADMIN_TOKEN_KEY, adminAccessToken);
        if (admin) localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
    },
    clear() {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
    },
    getAdminUser() {
        try {
            return JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || '{}');
        } catch {
            return {};
        }
    },
};

export const verifyTotpPin = async (totpPin) => {
    try {
        const response = await authApi.post('/admin/auth/verify-totp', { totpPin });
        if (response.data?.adminAccessToken) {
            adminTokenStore.set({
                adminAccessToken: response.data.adminAccessToken,
                admin: response.data.admin,
            });
        }
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const checkAdminSession = async () => {
    const token = adminTokenStore.getAccessToken();
    if (!token) {
        throw handleApiError({ response: { status: 401, data: { message: 'No admin access token' } } });
    }

    try {
        const response = await adminApi.get('/admin/auth/session', { skipAuthRedirect: true });
        return response.data;
    } catch (error) {
        adminTokenStore.clear();
        throw handleApiError(error);
    }
};

export const logoutAdmin = async () => {
    try {
        const response = await adminApi.post('/admin/auth/logout', {}, { skipAuthRedirect: true });
        adminTokenStore.clear();
        return response.data;
    } catch (error) {
        adminTokenStore.clear();
        throw handleApiError(error);
    }
};
