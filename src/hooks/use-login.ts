import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { loginApi } from '@/lib/api/auth';
import { fetchProfileData } from '@/lib/settings';
import { adminKeys } from '@/lib/query-keys';
import type { AxiosError } from 'axios';
import type { LoginResponse } from '@/lib/api/auth';

export const useLogin = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation<LoginResponse, AxiosError, any>({
        mutationFn: loginApi,
        onSuccess: async (response) => {
            const tokenData = response.data;
            if (tokenData?.access) {
                localStorage.setItem('access_token', tokenData.access);
            }
            if (tokenData?.refresh) {
                localStorage.setItem('refresh_token', tokenData.refresh);
            }
            try {
                const profile = await fetchProfileData();
                queryClient.setQueryData([...adminKeys.all, 'profile'], profile);
            } catch (error) {
                console.error("Failed to fetch admin profile post-login", error);
            }
            navigate({ to: '/' });
        },
    });
};
