'use client'

import { NavMain } from '@/components/main/nav-main'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar'
import { LayoutDashboard, BrainCircuit, Settings, LogOutIcon, Users, Shield } from 'lucide-react'
import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'

import imgProfile3D from '@/assets/male_profile.png'

export const data = {
    user: {
        name: 'David Plummer',
        email: 'hello@stemsparksolutions.com',
        avatar: imgProfile3D,
        role: 'System Administrator',
    },
    navMain: [
        {
            title: 'Overview',
            url: '/',
            icon: <LayoutDashboard />,
        },
        {
            title: 'Management',
            url: '/management',
            icon: <Users />,
        },
        {
            title: 'AI Reports',
            url: '/ai-reports',
            icon: <BrainCircuit />,
        },
        {
            title: 'Access Control',
            url: '/access-control',
            icon: <Shield />,
        },
        {
            title: 'Settings',
            url: '/settings',
            icon: <Settings />,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const navigate = useNavigate()

    return (
        <Sidebar
            variant="floating"
            collapsible="icon"
            className="[&>[data-sidebar=sidebar]]:rounded-[12px]  [&>[data-sidebar=sidebar]]:overflow-hidden"
            {...props}
        >
            <SidebarHeader className="pt-6 pb-2 bg-transparent">
                 <div className="flex justify-center w-full px-2">
                    <div className="h-12 w-full flex items-center justify-center gap-2 overflow-hidden">
                        <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain shrink" />
                        <h1 className="font-bold text-primary text-3xl truncate group-data-[collapsible=icon]:hidden">SPARK</h1>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-transparent px-0 ">
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter className="bg-transparent pb-4 px-2 ">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => navigate({ to: '/signin' })}>
                            <LogOutIcon />
                            <span>Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
