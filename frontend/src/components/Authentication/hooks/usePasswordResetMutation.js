import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toastError, toastSuccess } from "@/utils/toast-utils";
import { performPasswordReset } from "@/service/auth.service";

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
