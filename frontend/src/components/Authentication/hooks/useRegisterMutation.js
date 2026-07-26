import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toastError, toastSuccess } from "@/utils/toast-utils";
import { registerUser } from "@/service/user.service";

export function useRegisterMutation({ onSuccess: extraOnSuccess } = {}) {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: registerUser,
        onSuccess: (...args) => {
            toastSuccess('Registration successful');
            navigate('/login');
            extraOnSuccess?.(...args);
        },
        onError: (error) => {
            toastError(`Error in registration: ${error?.err?.message}`);
        },
    });
}
