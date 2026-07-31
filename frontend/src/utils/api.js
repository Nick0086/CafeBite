import axios from "axios";

const isProduction = import.meta.env.PROD === true;

const BASE_URL = isProduction ? import.meta.env.VITE_BASE_URL_PROD : import.meta.env.VITE_BASE_URL_LOCAL;

const MAX_RETRIES = 10;
const RETRY_INTERVAL = 100;

const TOKEN_KEYS = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
    userData: 'userData',
};

export const authApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

api.interceptors.request.use(async config => {
    try {
        const accessToken = await waitForToken();
        const refreshToken = localStorage.getItem(TOKEN_KEYS.refreshToken);
        if (accessToken) {
            config.headers.Authorization = accessToken;
        }
        if (refreshToken) {
            config.headers["user-data"] = refreshToken;
        }
    } catch (error) {
        console.error("Error retrieving token:", error);
    }
    return config;
}, error => {
    console.error("Request error:", error);
    return Promise.reject(error);
});

api.interceptors.response.use(
    response => response,
    (error) => {
        if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
            localStorage.removeItem(TOKEN_KEYS.accessToken);
            localStorage.removeItem(TOKEN_KEYS.refreshToken);
            localStorage.removeItem(TOKEN_KEYS.userData);
            if (window.location.pathname !== '/login') {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

const waitForToken = () => {
    let retries = 0;
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const accessToken = localStorage.getItem(TOKEN_KEYS.accessToken);
            const refreshToken = localStorage.getItem(TOKEN_KEYS.refreshToken);
            if (accessToken || refreshToken || retries >= MAX_RETRIES) {
                clearInterval(interval);
                if (accessToken || refreshToken) {
                    resolve(accessToken);
                } else {
                    reject(new Error("No token found after max retries"));
                }
            }
            retries++;
        }, RETRY_INTERVAL);
    });
};

export const handleApiError = (error) => {
    const defaultErrorMessage = "Hmmm... something seems to have gone wrong. Please try again later.";
    return {
        success: false,
        err: {
            message: error.response?.data?.message || defaultErrorMessage,
            status: error.response?.status || 500,
            error: error.response?.data?.error,
        },
    }
}
