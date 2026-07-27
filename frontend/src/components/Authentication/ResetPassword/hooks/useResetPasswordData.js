import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toastError, toastSuccess } from "@/utils/toast-utils";
import { performPasswordReset, validateResetToken } from "@/service/auth.service";
import { authQueryKeys } from "../constants/resetPassword.constants";

export function usePasswordResetMutation({ onSuccess: extraOnSuccess } = {}) {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: performPasswordReset,
        onSuccess: (...args) => {
            toastSuccess('Password reset successfully');
            navigate('/login');
            extraOnSuccess?.(...args);
        },
        onError: (error) => {
            console.error("Reset password error:", error?.err?.message || 'Unknown error');
            toastError(error?.err?.message || 'Failed to reset password.');
        },
    });
}

export function useValidateResetToken(token) {
    return useQuery({
        queryKey: [authQueryKeys.PASSWORD_RESET, token],
        queryFn: () => validateResetToken(token),
        retry: false,
        enabled: !!token,
    });
}
