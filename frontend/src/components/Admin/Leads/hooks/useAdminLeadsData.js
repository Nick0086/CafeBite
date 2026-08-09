import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { fetchAdminLeads } from '@/service/adminLeads.service';
import { logoutAdmin, adminTokenStore } from '@/service/adminAuth.service';
import { toastSuccess } from '@/utils/toast-utils';

export function useAdminLeadsData({ searchQuery = '', activeTab = 'all' } = {}) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const adminUser = adminTokenStore.getAdminUser();

    const { data: responseData, isLoading, isRefetching, refetch } = useQuery({
        queryKey: ['admin-leads', { search: searchQuery, status: activeTab }],
        queryFn: () => fetchAdminLeads({ search: searchQuery, status: activeTab }),
    });

    const leads = responseData?.data?.leads || [];
    const stats = responseData?.data?.stats || {
        totalLeads: 0,
        followUpsPending: 0,
        visitsScheduled: 0,
        closedWon: 0,
    };

    const logoutMutation = useMutation({
        mutationFn: logoutAdmin,
        onSuccess: () => {
            queryClient.clear();
            toastSuccess('Logged out successfully');
            navigate('/admin/login', { replace: true });
        },
        onError: () => {
            adminTokenStore.clear();
            queryClient.clear();
            navigate('/admin/login', { replace: true });
        },
    });

    return { adminUser, leads, stats, isLoading, isRefetching, refetch, logoutMutation };
}
