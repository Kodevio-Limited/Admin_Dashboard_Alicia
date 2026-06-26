import { useAppForm } from '@/components/form/form-context'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/__auth/forgot-password')({
    component: RouteComponent,
})

import { forgotPassword } from '@/lib/api/auth'
import { toast } from 'sonner'

const forgotSchema = z.object({
    identifier: z.string().min(1, 'Enter your email or phone number'),
})

function RouteComponent() {
    const navigate = useNavigate()

    const form = useAppForm({
        defaultValues: { identifier: '' },
        validators: { onChange: forgotSchema },
        onSubmit: async ({ value }) => {
            try {
                await forgotPassword(value.identifier)
                toast.success('Reset code sent successfully')
                navigate({ to: '/verification', search: { identifier: value.identifier } })
            } catch (error: any) {
                toast.error(error.message || 'Failed to send reset code')
            }
        },
    })

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center flex flex-col gap-2 mb-8">
                <h1 className="text-[28px] md:text-[32px] text-foreground font-bold tracking-tight">Forgot Password</h1>
                <p className="text-muted-foreground text-[15px]">Enter your email address to get a reset link</p>
            </div>

            <form
                className="flex flex-col gap-6"
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
            >
                <form.AppField name="identifier">
                    {(field) => (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="identifier" className="text-[15px] font-bold text-foreground">
                                Email or Phone Number
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] size-5" />
                                <Input
                                    id="identifier"
                                    type="text"
                                    placeholder="Enter your email or phone..."
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    className="pl-12 h-[52px] rounded-3xl bg-[#EEEEEE] border-0 focus-visible:ring-2 focus-visible:ring-primary/20 text-[15px] font-medium transition-all placeholder:text-[#888888]"
                                />
                            </div>
                            {field.state.meta.errors && field.state.meta.errors.length > 0 ? (
                                <p className="text-destructive text-sm font-medium px-4 text-center">
                                    {field.state.meta.errors.map((e: any) => typeof e === 'string' ? e : e?.message || JSON.stringify(e)).join(', ')}
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
                            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    )}
                </form.Subscribe>
            </form>

            <div className="text-center mt-2">
                <p className="text-muted-foreground text-[14px]">
                    Remember your password?{' '}
                    <Link to="/signin" className="text-[#FFB800] font-semibold hover:underline transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}
