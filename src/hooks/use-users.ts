import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query'
import {
    getProfile,
    updateProfile,
    changePassword,
    type UserProfile,
    type ChangePasswordData,
    type ChangePasswordResponse,
} from '@/lib/api/users'
import { adminKeys } from '@/lib/query-keys'

export const profileQueryOptions = () =>
    queryOptions<UserProfile, Error>({
        queryKey: [...adminKeys.all, 'profile'],
        queryFn: getProfile,
        enabled: !!localStorage.getItem('access_token'),
    })

export function useProfile() {
    return useQuery<UserProfile, Error>(profileQueryOptions())
}

export function useUpdateProfile() {
    const queryClient = useQueryClient()
    return useMutation<UserProfile, Error, Partial<UserProfile> | FormData>({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            queryClient.setQueryData([...adminKeys.all, 'profile'], data)
            queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'profile'] })
        },
    })
}

export function useChangePassword() {
    return useMutation<ChangePasswordResponse, Error, ChangePasswordData>({
        mutationFn: changePassword,
    })
}
