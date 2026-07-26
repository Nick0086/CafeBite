import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toastError, toastSuccess } from "@/utils/toast-utils";
import {
    requestPasswordReset,
    sendOneTimePassword,
    tokenStore,
    verifyOneTimePassword,
    verifyUserPassword,
} from "@/service/auth.service";

export function usePasswordLoginMutation() {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: verifyUserPassword,
        onSuccess: (res) => {
            tokenStore.set({
                accessToken: res?.sessionId?.accessToken,
                refreshToken: res?.sessionId?.refreshToken,
            });
            toastSuccess('Login Successful');
            navigate('/');
        },
        onError: (error) => {
            console.error("Login error:", error?.err?.message || 'Unknown error');
            toastError(error?.err?.message || 'Failed to verify login credentials.');
        },
    });
}

export function useOtpLoginMutation() {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: verifyOneTimePassword,
        onSuccess: (res) => {
            tokenStore.set({
                accessToken: res?.sessionId?.accessToken,
                refreshToken: res?.sessionId?.refreshToken,
                userData: res?.userData,
            });
            toastSuccess('Login Successful');
            navigate('/');
        },
        onError: (error) => {
            console.error("OTP error:", error?.err?.message || 'Unknown error');
            toastError(error?.err?.message || 'Failed to verify OTP.');
        },
    });
}

export function useSendOtpMutation({ onSuccess: extraOnSuccess } = {}) {
    return useMutation({
        mutationFn: sendOneTimePassword,
        onSuccess: (...args) => {
            extraOnSuccess?.(...args);
        },
        onError: (error) => {
            console.error("Send OTP error:", error?.err?.message || 'Unknown error');
            toastError(error?.err?.message || 'Failed to send OTP.');
        },
    });
}

export function useRequestPasswordResetMutation() {
    return useMutation({
        mutationFn: requestPasswordReset,
        onError: (error) => {
            console.error("Reset link error:", error?.err?.message || 'Unknown error');
            toastError(error?.err?.message || 'Failed to send reset link.');
        },
    });
}
