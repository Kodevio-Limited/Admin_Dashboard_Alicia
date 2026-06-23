import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { logoutApi } from '@/lib/api/auth';

export const useLogout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const logout = async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            try {
                await logoutApi(refreshToken);
            } catch (e) {
                // Ignore API failure
            }
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        queryClient.clear();

        navigate({
            to: '/signin',
            replace: true,
        });
    };

    return { logout };
};
