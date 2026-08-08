import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PilsatingDotesLoader from '@/components/ui/loaders/PilsatingDotesLoader';
import { checkAdminSession, adminTokenStore } from '@/service/adminAuth.service';

const ADMIN_SESSION_QUERY_KEY = ['adminSession', 'check'];

export function AdminPrivateRoutes() {
    const location = useLocation();
    const queryClient = useQueryClient();

    const { isSuccess, isError, isLoading } = useQuery({
        queryKey: ADMIN_SESSION_QUERY_KEY,
        queryFn: checkAdminSession,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (isError) {
            adminTokenStore.clear();
            queryClient.removeQueries({ queryKey: ADMIN_SESSION_QUERY_KEY });
        }
    }, [isError, queryClient]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-900">
                <PilsatingDotesLoader />
            </div>
        );
    }

    return isSuccess ? (
        <Outlet />
    ) : (
        <Navigate to="/admin/login" replace state={{ from: location }} />
    );
}

export default AdminPrivateRoutes;
