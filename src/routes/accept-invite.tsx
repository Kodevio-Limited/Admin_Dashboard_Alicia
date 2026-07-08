import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useValidateInviteToken, useAcceptInvite } from '@/hooks/use-invite'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/accept-invite')({
    validateSearch: (search: Record<string, unknown>) => {
        return {
            token: search.token as string | undefined,
        }
    },
    component: AcceptInvitePage,
})

function AcceptInvitePage() {
    const navigate = useNavigate()
    const search = Route.useSearch() as any
    const token = search.token as string

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const validateToken = useValidateInviteToken()
    const acceptInvite = useAcceptInvite()

    const [isValidating, setIsValidating] = useState(true)
    const [isValid, setIsValid] = useState(false)

    useEffect(() => {
        if (!token) {
            setIsValidating(false)
            setIsValid(false)
            return
        }

        validateToken.mutate(token, {
            onSuccess: () => {
                setIsValid(true)
                setIsValidating(false)
            },
            onError: (err: any) => {
                toast.error(err?.message || 'Invalid or expired invitation token')
                setIsValid(false)
                setIsValidating(false)
            },
        })
    }, [token])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long')
            return
        }

        acceptInvite.mutate(
            { token, password, confirm_password: confirmPassword },
            {
                onSuccess: (response) => {
                    toast.success('Account created successfully!')
                    const tokenData = response.data
                    if (tokenData?.access) {
                        localStorage.setItem('access_token', tokenData.access)
                    }
                    if (tokenData?.refresh) {
                        localStorage.setItem('refresh_token', tokenData.refresh)
                    }
                    // Redirect to home/dashboard
                    navigate({ to: '/' })
                },
                onError: (err: any) => {
                    toast.error(err?.message || 'Failed to set password')
                },
            }
        )
    }

    if (isValidating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Validating invitation...</p>
                </div>
            </div>
        )
    }

    if (!isValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <Card className="w-full max-w-md shadow-xl border-0 rounded-[32px]">
                    <CardHeader className="text-center pb-2 pt-8">
                        <CardTitle className="text-2xl font-bold">Invalid Invitation</CardTitle>
                        <CardDescription className="text-[15px] pt-2">
                            The invitation link is invalid or has expired. Please request a new invitation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8">
                        <Button className="w-full h-12 text-[15px] rounded-xl" onClick={() => navigate({ to: '/signin' })}>
                            Return to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md shadow-xl border-0 rounded-[32px]">
                <CardHeader className="text-center pb-6 pt-8">
                    <CardTitle className="text-2xl font-bold">Accept Invitation</CardTitle>
                    <CardDescription className="text-[15px] pt-2">
                        Set your password to activate your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-bold text-foreground">New Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-secondary border-0 h-12 rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-bold text-foreground">Confirm Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-secondary border-0 h-12 rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60"
                                required
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-12 text-[15px] rounded-xl mt-2" 
                            disabled={acceptInvite.isPending}
                        >
                            {acceptInvite.isPending ? 'Setting up account...' : 'Set Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
