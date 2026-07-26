import { useQuery } from "@tanstack/react-query";
import { checkUserSession } from "@/service/auth.service";
import { authQueryKeys } from "../constants/auth.constants";

export function useAuthSession() {
    return useQuery({
        queryKey: [authQueryKeys.LOGIN],
        queryFn: checkUserSession,
        retry: false,
    });
}
