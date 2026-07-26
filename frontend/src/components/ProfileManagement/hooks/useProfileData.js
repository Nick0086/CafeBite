import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getClientData, updateClientProfile } from "@/service/user.service";

const CLIENT_DATA_KEY = ['client', 'data'];

export function useClientData() {
    return useQuery({
        queryKey: CLIENT_DATA_KEY,
        queryFn: getClientData,
    });
}

export function useUpdateProfileMutation({ onSuccess: extraOnSuccess } = {}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateClientProfile,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: CLIENT_DATA_KEY });
            extraOnSuccess?.(data);
        },
    });
}
