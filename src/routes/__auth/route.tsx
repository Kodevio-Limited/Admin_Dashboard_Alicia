import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Zap } from 'lucide-react'

export const Route = createFileRoute('/__auth')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden p-4 md:p-8">
            {/* Symmetrical Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#03045e]/10 blur-3xl" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#03045e]/10 blur-3xl" />
            </div>

            <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 relative z-10">
                {/* Branding Header (Centered & Symmetrical) */}
                <div className="flex flex-col items-center justify-center text-center w-full mb-10">
                    <div className="size-20 rounded-2xl bg-[#03045e] flex items-center justify-center mb-6 shadow-xl ring-4 ring-[#03045e]/10">
                        <Zap className="size-10 text-[#febd09]" fill="#febd09" />
                    </div>
                    <h2 className="text-lg md:text-4xl font-bold mb-3 tracking-tight text-[#03045e]">ChargeSafe</h2>
                    <p className="text-base text-muted-foreground max-w-sm leading-relaxed">
                        Intelligent infrastructure monitoring and crisis management platform.
                    </p>
                </div>

                {/* Form Outlet */}
                <div className="w-full">
                    <Outlet />
                </div>

                {/* Footer text */}
                <div className="mt-12 text-center text-muted-foreground/60 text-sm w-full">
                    &copy; {new Date().getFullYear()} ChargeSafe. All rights reserved.
                </div>
            </div>
        </main>
    )
}
