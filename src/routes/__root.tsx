import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'

import '../styles.css'
import { Toaster } from 'sonner'

export interface MyRouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: RootComponent,
})

function RootComponent() {
    return (
        <>
            <Outlet />
            <Toaster />
        </>
    )
}
