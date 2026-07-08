import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { z } from 'zod'
import { verifyPassword, resendOtp } from '@/lib/api/auth'
import { toast } from 'sonner'

export const Route = createFileRoute('/__auth/verification')({
    component: TwoStepVerificationPage,
    validateSearch: z.object({
        identifier: z.string().optional(),
    }),
})

function TwoStepVerificationPage() {
    const navigate = useNavigate()
    const { identifier } = Route.useSearch()
    const [otp, setOtp] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)

    // FIX 1 — Guard: redirect immediately if no identifier was passed in the URL
    useEffect(() => {
        if (!identifier) {
            toast.error('Session expired. Please start over.')
            navigate({ to: '/forgot-password' })
        }
    }, [identifier, navigate])

    // Countdown ticker — decrements resendCooldown every second
    useEffect(() => {
        if (resendCooldown <= 0) return
        const id = setInterval(() => setResendCooldown((c) => c - 1), 1000)
        return () => clearInterval(id)
    }, [resendCooldown])

    // FIX 2 — "Send again" handler: calls API, shows toast, enforces 60-second cooldown
    const handleResend = async () => {
        if (!identifier || resendCooldown > 0 || isResending) return
        try {
            setIsResending(true)
            await resendOtp(identifier)
            toast.success('A new code has been sent. Check your email or phone.')
            setResendCooldown(60)
            setOtp('') // clear stale OTP input so user types the new code
        } catch (error: any) {
            toast.error(error.message || 'Failed to resend code. Please try again.')
        } finally {
            setIsResending(false)
        }
    }

    const handleVerify = async () => {
        if (otp.length !== 6) return
        if (!identifier) {
            toast.error('Missing identifier (email/phone). Please request a new code.')
            return
        }
        try {
            setIsVerifying(true)
            const res = await verifyPassword(identifier, otp)

            // FIX 3 — Removed the dangerous `|| otp` fallback that would use the
            // 6-digit OTP itself as a Bearer token when the API shape changes.
            // Now we throw a descriptive error if no token is in the response.
            const token =
                res?.data?.access ||
                res?.data?.access_token ||
                res?.data?.token ||
                res?.access ||
                res?.access_token ||
                res?.token

            if (!token) {
                throw new Error('Verification succeeded but no reset token was returned. Please try again.')
            }

            toast.success('Code verified successfully')
            navigate({ to: '/reset-password', search: { token } })
        } catch (error: any) {
            toast.error(error.message || 'Invalid or expired code')
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center flex flex-col items-center gap-2 mb-8">
                <h1 className="text-[28px] md:text-[32px] text-foreground font-bold tracking-tight">Verify Email</h1>
                <p className="text-muted-foreground text-[15px]">We've sent a 6-digit code to {identifier || 'your email'}</p>
            </div>

            {/* OTP */}
            <div className="flex flex-col gap-3 w-full">
                <label className="text-[15px] font-bold text-foreground">Verify OTP</label>
                <div className="flex justify-between items-center w-full">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp} className="w-full">
                        <InputOTPGroup className="w-full flex justify-between gap-2 sm:gap-3">
                            <InputOTPSlot
                                index={0}
                                className="w-full aspect-[4/5] sm:aspect-square sm:h-14 sm:w-14 rounded-[14px] border-0 text-lg font-bold bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                            />
                            <InputOTPSlot
                                index={1}
                                className="w-full aspect-[4/5] sm:aspect-square sm:h-14 sm:w-14 rounded-[14px] border-0 text-lg font-bold bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                            />
                            <InputOTPSlot
                                index={2}
                                className="w-full aspect-[4/5] sm:aspect-square sm:h-14 sm:w-14 rounded-[14px] border-0 text-lg font-bold bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                            />
                            <InputOTPSlot
                                index={3}
                                className="w-full aspect-[4/5] sm:aspect-square sm:h-14 sm:w-14 rounded-[14px] border-0 text-lg font-bold bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                            />
                            <InputOTPSlot
                                index={4}
                                className="w-full aspect-[4/5] sm:aspect-square sm:h-14 sm:w-14 rounded-[14px] border-0 text-lg font-bold bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                            />
                            <InputOTPSlot
                                index={5}
                                className="w-full aspect-[4/5] sm:aspect-square sm:h-14 sm:w-14 rounded-[14px] border-0 text-lg font-bold bg-secondary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                            />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                {/* FIX 4 — Resend row: delivery hint + wired "Send again" with live cooldown */}
                <div className="flex justify-between items-center mt-1">
                    <p className="text-muted-foreground text-[11px]">Check spam if not received</p>
                    <button
                        type="button"
                        disabled={resendCooldown > 0 || isResending || !identifier}
                        onClick={handleResend}
                        className="text-warning hover:text-warning/80 text-[11px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isResending
                            ? 'Sending...'
                            : resendCooldown > 0
                              ? `Resend in ${resendCooldown}s`
                              : 'Send again'}
                    </button>
                </div>
            </div>

            {/* Button */}
            <Button
                className="w-full mt-4 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-[15px] font-semibold"
                onClick={handleVerify}
                disabled={otp.length !== 6 || isVerifying}
            >
                {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
        </div>
    )
}
