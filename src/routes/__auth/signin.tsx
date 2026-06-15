import { useAppForm } from '@/components/form/form-context'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import * as z from 'zod'
import { auth } from '@/lib/auth-client'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/__auth/signin')({
    component: RouteComponent,
})

const signinSchema = z.object({
    email: z.email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(32, 'Password must be at most 32 characters'),
    remember: z.boolean(),
})

function RouteComponent() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)

    const form = useAppForm({
        defaultValues: { email: '', password: '', remember: false },
        validators: { onChange: signinSchema },
        onSubmit: async ({ value }) => {
            await auth.signIn.email(
                {
                    email: value.email,
                    password: value.password,
                    rememberMe: value.remember,
                },
                {
                    onSuccess: async ({ data }) => {
                        if (!data.user.emailVerified) {
                            navigate({ to: '/verification', search: { user: data.user.email, type: 'signup' } as any })
                        } else if (data.user.role !== 'admin' && data.user.role !== 'superadmin') {
                            await auth.signOut()
                            toast.error('No access')
                            navigate({ to: '/signin' } as any)
                        } else {
                            navigate({ to: '/' })
                        }
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message || 'Failed to sign in')
                    },
                },
            )
        },
    })

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center flex flex-col gap-2 border-b pb-6 mb-2 border-muted/50">
                <h1 className="text-2xl md:text-3xl text-foreground font-semibold tracking-tight">Sign In to Your Account</h1>
                <p className="text-muted-foreground text-sm md:text-base">Access your dashboard and manage operations</p>
            </div>

            <form
                className="flex flex-col gap-6"
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
            >
                <form.AppField name="email">
                    {(field) => (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email" className="text-base font-semibold text-foreground">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 text-base transition-all"
                                />
                            </div>
                            {field.state.meta.errors ? (
                                <p className="text-destructive text-sm font-medium px-4 text-center">
                                    {field.state.meta.errors.join(', ')}
                                </p>
                            ) : null}
                        </div>
                    )}
                </form.AppField>

                <form.AppField name="password">
                    {(field) => (
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-base font-semibold text-foreground">
                                    Password
                                </Label>
                                <Link
                                    to="/forgot-password"
                                    className="text-primary hover:text-primary/90 text-sm font-semibold hover:underline transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    className="pl-12 pr-12 h-14 rounded-2xl bg-muted/30 border-2 border-transparent focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 text-base transition-all"
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    aria-pressed={showPassword}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:text-foreground"
                                >
                                    {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                                </button>
                            </div>
                            {field.state.meta.errors ? (
                                <p className="text-destructive text-sm font-medium px-4 text-center">
                                    {field.state.meta.errors.join(', ')}
                                </p>
                            ) : null}
                        </div>
                    )}
                </form.AppField>

                <form.Subscribe selector={(state) => [state.isSubmitting]}>
                    {([isSubmitting]) => (
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            size="lg"
                            className="w-full mt-2"
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign In'}
                        </Button>
                    )}
                </form.Subscribe>
            </form>
        </div>
    )
}
