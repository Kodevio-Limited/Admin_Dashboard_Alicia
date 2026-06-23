import { useAppForm } from '@/components/form/form-context'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import * as z from 'zod'
import { useLogin } from '@/lib/api/login'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/__auth/signin')({
    beforeLoad: () => {
        if (localStorage.getItem('access_token')) {
            throw redirect({ to: '/' })
        }
    },
    component: RouteComponent,
})

const signinSchema = z.object({
    email: z.email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(32, 'Password must be at most 32 characters'),
    remember: z.boolean(),
})

function RouteComponent() {
    const [showPassword, setShowPassword] = useState(false)
    const loginMutation = useLogin()

    const form = useAppForm({
        defaultValues: { email: '', password: '', remember: false },
        validators: { onChange: signinSchema },
        onSubmit: async ({ value }) => {
            loginMutation.mutate({
                username: value.email,
                password: value.password,
            }, {
                onError: (error: any) => {
                    toast.error(error.message || 'Failed to sign in')
                }
            })
        },
    })

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center flex flex-col gap-2 mb-8">
                <h1 className="text-[28px] md:text-[32px] text-foreground font-bold tracking-tight">Sign In</h1>
                <p className="text-muted-foreground text-[15px]">Access your account with correct information</p>
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
                            <Label htmlFor="email" className="text-[15px] font-bold text-foreground">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] size-5" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email..."
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    className="pl-12 h-[52px] rounded-3xl bg-[#EEEEEE] border-0 focus-visible:ring-2 focus-visible:ring-primary/20 text-[15px] font-medium transition-all placeholder:text-[#888888]"
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
                                <Label htmlFor="password" className="text-[15px] font-bold text-foreground">
                                    Password
                                </Label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] size-5" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="********"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    className="pl-12 pr-12 h-[52px] rounded-3xl bg-[#EEEEEE] border-0 focus-visible:ring-2 focus-visible:ring-primary/20 text-[15px] font-medium transition-all placeholder:text-[#888888]"
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    aria-pressed={showPassword}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] hover:text-foreground transition-colors outline-none"
                                >
                                    {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                                </button>
                            </div>
                            <div className="flex justify-end mt-1">
                                <Link
                                    to="/forgot-password"
                                    className="text-[#FFB800] hover:text-[#FFB800]/80 text-[13px] font-semibold transition-colors"
                                >
                                    Forgot password?
                                </Link>
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
                            className="w-full mt-4 h-14 rounded-full bg-[#03063A] hover:bg-[#03063A]/90 text-white text-[15px] font-semibold"
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign In'}
                        </Button>
                    )}
                </form.Subscribe>
            </form>
        </div>
    )
}
