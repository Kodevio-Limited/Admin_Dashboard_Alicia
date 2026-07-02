import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { loginApi } from '@/lib/api/auth'
import type { LoginResponse } from '@/lib/api/auth'
import { profileQueryOptions } from '@/hooks/use-users'

export const useLogin = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation<LoginResponse, Error, any>({
        mutationFn: loginApi,
        onSuccess: async (response) => {
            const tokenData = response.data
            if (tokenData?.access) {
                localStorage.setItem('access_token', tokenData.access)
            }
            if (tokenData?.refresh) {
                localStorage.setItem('refresh_token', tokenData.refresh)
            }

            try {
                // Prefetch the user data instantly
                const profile = await queryClient.fetchQuery(profileQueryOptions())
                
                if (profile.role !== 'admin') {
                    throw new Error('Access denied: You must be an admin user to access this dashboard.')
                }
            } catch (error) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                throw error
            }

            navigate({ to: '/' })
        },
    })
}
