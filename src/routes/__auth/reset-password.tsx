import { useAppForm } from '@/components/form/form-context'
import { createFileRoute } from '@tanstack/react-router'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const searchSchema = z.object({
    token: z.string().optional(),
    error: z.string().optional(),
})

export const Route = createFileRoute('/__auth/reset-password')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

const resetSchema = z
    .object({
        password: z.string().min(8, 'Password must be at least 8 characters').max(32, 'Password must be at most 32 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })

function RouteComponent() {
    const { token, error } = Route.useSearch()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const form = useAppForm({
        defaultValues: { password: '', confirmPassword: '' },
        validators: { onChange: resetSchema },
        onSubmit: async ({ value }) => {
            console.log(value)
            // if (!token) {
            //     toast.error('Reset link is invalid or has expired. Please request a new one.')
            //     return
            // }
            // await auth.resetPassword( ... )
        },
    })

    if (error || !token) {
        return (
            <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center flex flex-col gap-2 mb-8">
                    <h1 className="text-[28px] md:text-[32px] text-foreground font-bold tracking-tight">Invalid Link</h1>
                    <p className="text-muted-foreground text-[15px]">
                        Reset link is invalid or has expired.{' '}
                        <a href="/forgot-password" className="text-[#FFB800] font-semibold hover:underline transition-colors">
                            Request a new one
                        </a>
                        .
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center flex flex-col gap-2 mb-8">
                <h1 className="text-[28px] md:text-[32px] text-foreground font-bold tracking-tight">Reset Password</h1>
                <p className="text-muted-foreground text-[15px]">Enter your new password below</p>
            </div>

            <form
                className="flex flex-col gap-6"
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
            >
                <form.AppField name="password">
                    {(field) => (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password" className="text-[15px] font-bold text-foreground">
                                New Password
                            </Label>
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
                            {field.state.meta.errors ? (
                                <p className="text-destructive text-sm font-medium px-4 text-center">
                                    {field.state.meta.errors.join(', ')}
                                </p>
                            ) : null}
                        </div>
                    )}
                </form.AppField>

                <form.AppField name="confirmPassword">
                    {(field) => (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="confirmPassword" className="text-[15px] font-bold text-foreground">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] size-5" />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="********"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    className="pl-12 pr-12 h-[52px] rounded-3xl bg-[#EEEEEE] border-0 focus-visible:ring-2 focus-visible:ring-primary/20 text-[15px] font-medium transition-all placeholder:text-[#888888]"
                                />
                                <button
                                    type="button"
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    aria-pressed={showConfirmPassword}
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] hover:text-foreground transition-colors outline-none"
                                >
                                    {showConfirmPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
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
                            className="w-full mt-4 h-14 rounded-full bg-[#03063A] hover:bg-[#03063A]/90 text-white text-[15px] font-semibold"
                        >
                            {isSubmitting ? 'Resetting...' : 'Submit'}
                        </Button>
                    )}
                </form.Subscribe>
            </form>
        </div>
    )
}
