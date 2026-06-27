import { AppSidebar } from '#/components/main/app-sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { NavUser } from '@/components/main/nav-user'
import { createFileRoute, Link, Outlet, useRouterState, redirect } from '@tanstack/react-router'
import { useProfile, profileQueryOptions } from '@/hooks/use-users'

const routeLabels: Record<string, string> = {
    '/': 'Dashboard',
    '/alerts': 'Alerts',
    '/map': 'Map',
    '/infrastructure': 'Infrastructure',
    '/ai-reports': 'AI Reports',
    '/settings': 'Settings',
}

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async ({ context }) => {
        const token = localStorage.getItem('access_token')
        if (!token) {
            throw redirect({ to: '/signin' })
        }

        try {
            await context.queryClient.ensureQueryData(profileQueryOptions())
        } catch {
            throw redirect({ to: '/signin' })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const pathname = useRouterState({ select: (s) => s.location.pathname })
    const { data: user } = useProfile()

    const segments = pathname.split('/').filter(Boolean)
    const crumbs = segments.map((_, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/')
        const label = routeLabels[href] ?? segments[index].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        return { href, label }
    })

    const isHome = pathname === '/'

    return (
        <SidebarProvider className="bg-muted">
            <TooltipProvider>
                <AppSidebar />
                <SidebarInset className="bg-transparent">
                    <header className="bg-white/80 backdrop-blur-md h-14 rounded-[12px] shadow-sm border border-black/5 flex items-center justify-between px-3 md:px-5 shrink-0 w-full mb-0 sticky top-2 z-10 mx-2 md:mx-4 mt-2 max-w-[calc(100%-16px)] md:max-w-[calc(100%-32px)]">
                        <div className="flex items-center gap-3 flex-1">
                            <SidebarTrigger className="-ml-2 size-8" />
                            <Separator orientation="vertical" className="my-auto mr-1 h-4 hidden md:block" />

                            <Breadcrumb className="hidden xl:flex ml-3">
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        {isHome ? (
                                            <BreadcrumbPage className="text-sm">Dashboard</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild className="text-sm">
                                                <Link to="/">Dashboard</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>

                                    {crumbs.map((crumb, index) => {
                                        const isLast = index === crumbs.length - 1
                                        return (
                                            <span key={crumb.href} className="contents">
                                                <BreadcrumbSeparator />
                                                <BreadcrumbItem>
                                                    {isLast ? (
                                                        <BreadcrumbPage className="text-sm">{crumb.label}</BreadcrumbPage>
                                                    ) : (
                                                        <BreadcrumbLink asChild className="text-sm">
                                                            <Link to={crumb.href}>{crumb.label}</Link>
                                                        </BreadcrumbLink>
                                                    )}
                                                </BreadcrumbItem>
                                            </span>
                                        )
                                    })}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>

                        {user && (
                            <div className="flex gap-3 items-center shrink-0">
                                <span className="hidden lg:flex items-center gap-1.5 rounded-md border bg-muted px-2.5 py-0.5 text-[11px] uppercase font-bold text-muted-foreground">
                                    {user.role}
                                </span>
                                <NavUser user={{ name: user.full_name, email: user.email, avatar: user.avatar }} />
                            </div>
                        )}
                    </header>
                    <div className="flex flex-1 flex-col gap-3 px-4 md:px-6 lg:px-8 pb-2 pt-2 md:pt-4 w-full mt-0">
                        <Outlet />
                    </div>
                </SidebarInset>
            </TooltipProvider>
        </SidebarProvider>
    )
}
