import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { ShieldCheck } from 'lucide-react'

import { z } from 'zod'
import { verifyPassword } from '@/lib/api/auth'
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

    const handleVerify = async () => {
        if (otp.length !== 6) return
        if (!identifier) {
            toast.error('Missing identifier (email/phone). Please request a new code.')
            return
        }
        try {
            setIsVerifying(true)
            const res = await verifyPassword(identifier, otp)
            // Assuming the backend returns an access token in the response
            const token =
                res?.data?.access || res?.data?.access_token || res?.data?.token || res?.access || res?.access_token || res?.token || otp
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
                <div className="flex justify-end mt-1">
                    <button className="text-warning hover:text-warning/80 text-[11px] font-semibold transition-all">Send again</button>
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
