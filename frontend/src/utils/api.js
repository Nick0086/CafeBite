import axios from "axios";
import { toast } from 'react-toastify';

const isProduction = import.meta.env.PROD === true;
// console.log("isProduction1", import.meta.env.MODE);

const BASE_URL = isProduction ? import.meta.env.VITE_BASE_URL_PROD : import.meta.env.VITE_BASE_URL_LOCAL;
const SOCKET_URL = isProduction ? import.meta.env.VITE_SOCKET_URL_PROD : import.meta.env.VITE_SOCKET_URL_LOCAL;

const MAX_RETRIES = 10;
const RETRY_INTERVAL = 100;

// export const socket = io(SOCKET_URL);

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
        const token = await waitForToken();
        if (token) {
            config.headers.Authorization = token.accessToken;
            config.headers["user-data"] = token.refreshToken;
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
    error => {
        if (error.response && error.response.status === 401) {
            console.log("401 detected, signing out...");
            // toast.error("Session expired, please sign in again");
            window.localStorage.removeItem('accessToken');
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

const waitForToken = () => {
    let retries = 0;
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const refreshToken = window.localStorage.getItem('refreshToken');
            const accessToken = window.localStorage.getItem('accessToken');
            if (accessToken || refreshToken || retries >= MAX_RETRIES) {
                clearInterval(interval);
                if (accessToken || refreshToken) {
                    resolve({ accessToken, refreshToken });
                } else {
                    reject(new Error("No token found after max retries"));
                    window.localStorage.clear();
                    // window.location.href = "/login";
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