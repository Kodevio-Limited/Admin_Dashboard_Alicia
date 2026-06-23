import { useQuery } from '@tanstack/react-query';
import { fetchProfileData } from '@/lib/settings';
import { adminKeys } from '@/lib/query-keys';

export const useCurrentUser = () => {
    return useQuery({
        queryKey: [...adminKeys.all, 'profile'],
        queryFn: fetchProfileData,
        retry: false,
        enabled: !!localStorage.getItem('access_token'),
    });
};
