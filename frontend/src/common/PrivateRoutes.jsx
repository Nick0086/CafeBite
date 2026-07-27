import PilsatingDotesLoader from "@/components/ui/loaders/PilsatingDotesLoader";
import { PermissionsContext } from "@/contexts/PermissionsContext";
import { checkUserSession, tokenStore } from "@/service/auth.service";
import { getClientData } from "@/service/user.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

const SESSION_QUERY_KEY = ['session', 'check'];

export function PrivateRoutes() {
    const location = useLocation();
    const queryClient = useQueryClient();
    const { updatePermissions } = useContext(PermissionsContext);

    const { isSuccess, isError, isLoading } = useQuery({
        queryKey: SESSION_QUERY_KEY,
        queryFn: checkUserSession,
        retry: false,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (isSuccess) {
            queryClient
                .fetchQuery({ queryKey: ['client', 'data'], queryFn: getClientData })
                .then((res) => { if (res?.data) updatePermissions(res.data); })
                .catch(() => {});
        }
        if (isError) {
            tokenStore.clear();
            queryClient.clear();
        }
    }, [isSuccess, isError, queryClient, updatePermissions]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <PilsatingDotesLoader />
            </div>
        );
    }

    // Direct render-time auth check: avoids the state update delay
    // that creates a continuous redirect loop with the login page.
    return isSuccess ? (
        <Outlet />
    ) : (
        <Navigate to="/login" replace state={{ from: location }} />
    );
}

export default PrivateRoutes;
