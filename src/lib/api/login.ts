import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from '@tanstack/react-router';

export const useLogin = () => {
    const { setUser } = useAuth();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (credentials: { username: string; password: string }) => {
            const response = await apiClient.post('/auth/login/', credentials);
            return response.data;
        },
        onSuccess: (data, variables) => {
            if (data.access) {
                localStorage.setItem('access_token', data.access);
            }
            if (data.refresh) {
                localStorage.setItem('refresh_token', data.refresh);
            }
            setUser({ email: variables.username });
            navigate({ to: '/' });
        },
    });
};
