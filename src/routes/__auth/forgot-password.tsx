import { useAppForm } from '@/components/form/form-context'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { z } from 'zod'

export const Route = createFileRoute('/__auth/forgot-password')({
    component: RouteComponent,
})

const forgotSchema = z.object({
    email: z.email('Enter your email address'),
})

function RouteComponent() {
    // const navigate = useNavigate()

    const form = useAppForm({
        defaultValues: { email: '' },
        validators: { onChange: forgotSchema },
        onSubmit: async ({ value }) => {
            console.log(value)
            // await auth.requestPasswordReset(
            //     {
            //         email: value.email,
            //         redirectTo: `${import.meta.env.VITE_APP_CLIENT}/reset-password`,
            //     },
            //     {
            //         onSuccess: () => {
            //             toast.success("Password reset link sent to your email!");
            //             navigate({ to: "/verification", search: { user: value.email, type: "reset" } });
            //         },
            //     },
            // );
        },
    })

    return (
        <div className="flex flex-col gap-8 max-w-md w-full mx-auto">
            <div className="text-center">
                <h1 className="text-4xl text-foreground font-semibold tracking-tight">Forgot Password</h1>
                <p className="mt-3 text-muted-foreground text-lg">Enter your email address and we'll send you a link to reset your password.</p>
            </div>

            <form
                className="flex flex-col gap-5"
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
            >
                <form.AppField name="email">
                    {(field) => (
                        <div className="flex flex-col gap-2">
                            <label className="text-foreground text-lg font-semibold">Email Address</label>
                            <div className="flex items-center gap-3 bg-muted rounded-full px-5 py-4 transition-colors focus-within:ring-2 focus-within:ring-primary/20">
                                <Mail className="text-muted-foreground shrink-0" size={22} />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-[15px]"
                                />
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
                            className="w-full bg-primary text-white rounded-full py-5 shadow-md hover:bg-primary/90 transition-colors font-semibold text-[18px] mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    )}
                </form.Subscribe>
            </form>

            <div className="text-center mt-2">
                <p className="text-muted-foreground text-sm">
                    Remember your password?{' '}
                    <Link to="/signin" className="text-primary font-semibold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}
