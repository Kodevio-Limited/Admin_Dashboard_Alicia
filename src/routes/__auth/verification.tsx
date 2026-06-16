import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/__auth/verification')({
    component: TwoStepVerificationPage,
})

function TwoStepVerificationPage() {
    const navigate = useNavigate()
    const [otp, setOtp] = useState('')

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center flex flex-col items-center gap-2 mb-8">
                <h1 className="text-[28px] md:text-[32px] text-foreground font-bold tracking-tight">Verify Email</h1>
                <p className="text-[#888888] text-[15px]">
                    We've sent a 6-digit code to your email
                </p>
            </div>

            {/* OTP */}
            <div className="flex flex-col gap-3 w-full">
                <label className="text-[15px] font-bold text-foreground">Verify OTP</label>
                <div className="flex justify-between items-center w-full">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp} className="w-full">
                        <InputOTPGroup className="w-full flex justify-between gap-2 sm:gap-3">
                            <InputOTPSlot index={0} className="w-full aspect-[4/5] sm:aspect-square sm:h-14 sm:w-14 rounded-[14px] border-0 text-lg font-bold bg-[#EEEEEE] focus-visible:ring-2 focus-visible:ring-primary/20 transition-all" />
                            <InputOTPSlot index={1} className="w-full aspect-[4/5] sm:aspect-square sm:h-14 sm:w-14 rounded-[14px] border-0 text-lg font-bold bg-[#EEEEEE] focus-visible:ring-2 focus-visible:ring-primary/20 transition-all" />
                            <InputOTPSlot index={2} className="w-full aspect-[4/5] sm:aspect-square sm:h-14 sm:w-14 rounded-[14px] border-0 text-lg font-bold bg-[#EEEEEE] focus-visible:ring-2 focus-visible:ring-primary/20 transition-all" />
                            <InputOTPSlot index={3} className="w-full aspect-[4/5] sm:aspect-square sm:h-14 sm:w-14 rounded-[14px] border-0 text-lg font-bold bg-[#EEEEEE] focus-visible:ring-2 focus-visible:ring-primary/20 transition-all" />
                            <InputOTPSlot index={4} className="w-full aspect-[4/5] sm:aspect-square sm:h-14 sm:w-14 rounded-[14px] border-0 text-lg font-bold bg-[#EEEEEE] focus-visible:ring-2 focus-visible:ring-primary/20 transition-all" />
                            <InputOTPSlot index={5} className="w-full aspect-[4/5] sm:aspect-square sm:h-14 sm:w-14 rounded-[14px] border-0 text-lg font-bold bg-[#EEEEEE] focus-visible:ring-2 focus-visible:ring-primary/20 transition-all" />
                        </InputOTPGroup>
                    </InputOTP>
                </div>
                <div className="flex justify-end mt-1">
                    <button className="text-[#FFB800] hover:text-[#FFB800]/80 text-[11px] font-semibold transition-all">Send again</button>
                </div>
            </div>

            {/* Button */}
            <Button
                className="w-full mt-4 h-14 rounded-full bg-[#03063A] hover:bg-[#03063A]/90 text-white text-[15px] font-semibold"
                onClick={() => navigate({ to: '/' })}
                disabled={otp.length !== 6}
            >
                Verify
            </Button>
        </div>
    )
}
