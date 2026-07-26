import PilsatingDotesLoader from "@/components/ui/loaders/PilsatingDotesLoader";
import { PermissionsContext } from "@/contexts/PermissionsContext";
import { checkUserSession, tokenStore } from "@/service/auth.service";
import { getClientData } from "@/service/user.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useContext } from "react";
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

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (isSuccess) {
            setIsAuthenticated(true);
            queryClient
                .fetchQuery({ queryKey: ['client', 'data'], queryFn: getClientData })
                .then((res) => { if (res?.data) updatePermissions(res.data); })
                .catch(() => {});
        }
        if (isError) {
            tokenStore.clear();
            setIsAuthenticated(false);
        }
    }, [isSuccess, isError, queryClient, updatePermissions]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <PilsatingDotesLoader />
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

export default PrivateRoutes;
