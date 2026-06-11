import { useAppForm } from '@/components/form/form-context'
import { createFileRoute } from '@tanstack/react-router'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import * as z from 'zod'

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
            // await auth.resetPassword(
            //     { token, newPassword: value.password },
            //     {
            //         onSuccess: () => {
            //             toast.success('Password reset successfully!')
            //             navigate({ to: '/signin' })
            //         },
            //     },
            // )
        },
    })

    if (error || !token) {
        return (
            <p className="text-center text-sm text-muted-foreground">
                Reset link is invalid or has expired.{' '}
                <a href="/forgot-password" className="underline">
                    Request a new one
                </a>
                .
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-8 max-w-md w-full mx-auto">
            <div className="text-center">
                <h1 className="text-4xl text-[#2d2f33] font-semibold tracking-tight">Reset Password</h1>
                <p className="mt-3 text-[#888] text-lg">Enter your new password below.</p>
            </div>

            <form
                className="flex flex-col gap-5"
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
            >
                <form.AppField name="password">
                    {(field) => (
                        <div className="flex flex-col gap-2">
                            <label className="text-[#2d2f33] text-lg font-semibold">New Password</label>
                            <div className="flex items-center gap-3 bg-[#e9e9e9] rounded-full px-5 py-4 transition-colors focus-within:ring-2 focus-within:ring-primary/20">
                                <Lock className="text-[#989898] shrink-0" size={22} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    className="flex-1 bg-transparent outline-none text-[#1e1e20] placeholder:text-[#989898] text-[15px]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="text-[#989898] shrink-0 hover:text-[#1e1e20] transition-colors"
                                >
                                    {showPassword ? <Eye size={22} /> : <EyeOff size={22} />}
                                </button>
                            </div>
                            {field.state.meta.errors ? (
                                <p className="text-destructive text-sm font-medium">{field.state.meta.errors.join(', ')}</p>
                            ) : null}
                        </div>
                    )}
                </form.AppField>

                <form.AppField name="confirmPassword">
                    {(field) => (
                        <div className="flex flex-col gap-2">
                            <label className="text-[#2d2f33] text-lg font-semibold">Confirm Password</label>
                            <div className="flex items-center gap-3 bg-[#e9e9e9] rounded-full px-5 py-4 transition-colors focus-within:ring-2 focus-within:ring-primary/20">
                                <Lock className="text-[#989898] shrink-0" size={22} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    className="flex-1 bg-transparent outline-none text-[#1e1e20] placeholder:text-[#989898] text-[15px]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    className="text-[#989898] shrink-0 hover:text-[#1e1e20] transition-colors"
                                >
                                    {showConfirmPassword ? <Eye size={22} /> : <EyeOff size={22} />}
                                </button>
                            </div>
                            {field.state.meta.errors ? (
                                <p className="text-destructive text-sm font-medium">{field.state.meta.errors.join(', ')}</p>
                            ) : null}
                        </div>
                    )}
                </form.AppField>

                <form.Subscribe selector={(state) => [state.isSubmitting]}>
                    {([isSubmitting]) => (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#03045e] text-white rounded-full py-5 shadow-md hover:bg-[#03045e]/90 transition-colors font-semibold text-[18px] mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Resetting...' : 'Submit'}
                        </button>
                    )}
                </form.Subscribe>
            </form>
        </div>
    )
}
