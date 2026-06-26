import { queryOptions } from '@tanstack/react-query';
import { fetchProfileData } from '@/lib/settings';
import { adminKeys } from '@/lib/query-keys';

export const currentUserQueryOptions = () =>
    queryOptions({
        queryKey: [...adminKeys.all, 'profile'],
        queryFn: fetchProfileData,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!localStorage.getItem('access_token'),
    });
