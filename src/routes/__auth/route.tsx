import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router'

export const Route = createFileRoute('/__auth')({
    component: RouteComponent,
})

// Map your different images to each specific route here!
const routeImages: Record<string, string> = {
    '/signin': '/auth/signin.png', // Change to e.g. '/signin-bg.jpg'
    '/verification': '/auth/verification.png', // Change to e.g. '/verify-bg.jpg'
    '/forgot-password': '/auth/forgot-password.png', // Change to e.g. '/forgot-bg.jpg'
    '/reset-password': '/auth/reset-password.png', // Change to e.g. '/reset-bg.jpg'
}

function RouteComponent() {
    const location = useLocation()

    // Get the image for the current path, fallback to placeholder if not found
    const bgImage = routeImages[location.pathname] || '/placeholder.jpg'

    return (
        <main className="min-h-screen w-full flex bg-white">
            {/* Left Column: Image (Sticky to prevent clipping on scroll) */}
            <div className="hidden lg:block w-1/2 p-4 sticky top-0 h-screen">
                <div className="w-full h-full rounded-3xl overflow-hidden relative bg-muted">
                    <img src={bgImage} alt="Disaster Management Operations" className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 relative min-h-screen">
                {/* Form Container */}
                <div className="w-full max-w-md flex flex-col">
                    {/* Form Outlet */}
                    <Outlet />

                    {/* Footer text */}
                    <div className="mt-16 text-center text-muted-foreground/60 text-sm w-full">
                        &copy; {new Date().getFullYear()} ChargeSafe. All rights reserved.
                    </div>
                </div>
            </div>
        </main>
    )
}
