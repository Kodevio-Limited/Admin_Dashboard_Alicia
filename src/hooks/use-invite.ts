import { useMutation } from '@tanstack/react-query'
import { validateInviteToken, acceptInvite } from '@/lib/api/auth'

export function useValidateInviteToken() {
    return useMutation({
        mutationFn: (token: string) => validateInviteToken(token),
    })
}

export function useAcceptInvite() {
    return useMutation({
        mutationFn: (data: { token: string; password: string; confirm_password: string }) => acceptInvite(data),
    })
}
