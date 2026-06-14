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
            <div className="text-center flex flex-col items-center gap-3 border-b pb-6 mb-2 border-muted/50">
                <div className="size-16 bg-[#03045e]/10 rounded-full flex items-center justify-center text-[#03045e] mb-2">
                    <ShieldCheck className="size-8" />
                </div>
                <h1 className="text-2xl md:text-3xl text-foreground font-semibold tracking-tight">Two-Step Verification</h1>
                <p className="text-muted-foreground text-sm md:text-base px-4">
                    We sent a verification code to <span className="font-semibold text-foreground block mt-1">example@gmail.com</span>
                </p>
            </div>

            {/* OTP */}
            <div className="flex justify-center my-4">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} className="gap-2">
                    <InputOTPGroup className="gap-2 sm:gap-4">
                        <InputOTPSlot
                            index={0}
                            className="size-12 sm:size-14 rounded-2xl border-2 text-xl font-bold bg-muted/30 focus-visible:ring-4 focus-visible:ring-[#03045e]/10 focus-visible:border-[#03045e]/50 transition-all"
                        />
                        <InputOTPSlot
                            index={1}
                            className="size-12 sm:size-14 rounded-2xl border-2 text-xl font-bold bg-muted/30 focus-visible:ring-4 focus-visible:ring-[#03045e]/10 focus-visible:border-[#03045e]/50 transition-all"
                        />
                        <InputOTPSlot
                            index={2}
                            className="size-12 sm:size-14 rounded-2xl border-2 text-xl font-bold bg-muted/30 focus-visible:ring-4 focus-visible:ring-[#03045e]/10 focus-visible:border-[#03045e]/50 transition-all"
                        />
                        <InputOTPSlot
                            index={3}
                            className="size-12 sm:size-14 rounded-2xl border-2 text-xl font-bold bg-muted/30 focus-visible:ring-4 focus-visible:ring-[#03045e]/10 focus-visible:border-[#03045e]/50 transition-all"
                        />
                        <InputOTPSlot
                            index={4}
                            className="size-12 sm:size-14 rounded-2xl border-2 text-xl font-bold bg-muted/30 focus-visible:ring-4 focus-visible:ring-[#03045e]/10 focus-visible:border-[#03045e]/50 transition-all"
                        />
                        <InputOTPSlot
                            index={5}
                            className="size-12 sm:size-14 rounded-2xl border-2 text-xl font-bold bg-muted/30 focus-visible:ring-4 focus-visible:ring-[#03045e]/10 focus-visible:border-[#03045e]/50 transition-all"
                        />
                    </InputOTPGroup>
                </InputOTP>
            </div>

            {/* Button */}
            <Button
                size="lg"
                className="w-full"
                onClick={() => navigate({ to: '/' })}
                disabled={otp.length !== 6}
            >
                Verify Account
            </Button>

            {/* Resend */}
            <p className="text-center text-muted-foreground text-sm font-medium mt-2">
                Didn't receive the code?{' '}
                <button className="text-[#03045e] hover:text-[#020348] font-bold hover:underline transition-all">Resend code</button>
            </p>
        </div>
    )
}
