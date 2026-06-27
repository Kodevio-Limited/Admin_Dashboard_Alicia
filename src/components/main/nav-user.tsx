import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/components/ui/sidebar'
import { Link } from '@tanstack/react-router'
import { BadgeCheckIcon, LogOutIcon } from 'lucide-react'
import { useState } from 'react'
import { useLogout } from '@/hooks/use-logout'

export function NavUser({
    user,
}: {
    user: {
        name: string
        email: string
        avatar?: string
    }
}) {
    const { isMobile } = useSidebar()
    const { logout } = useLogout()
    const [logoutOpen, setLogoutOpen] = useState(false)

    const handleLogout = async () => {
        setLogoutOpen(false)
        await logout()
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer focus:outline-none hover:opacity-80 transition-opacity">
                        <Avatar className="size-8 ring-2 ring-border">
                            <AvatarImage src={user.avatar || undefined} alt={user.name} />
                            <AvatarFallback>{user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left hidden md:flex">
                            <p className="font-semibold text-foreground text-[13px] leading-tight">{user.name}</p>
                            <p className="text-muted-foreground text-[11px] leading-tight">{user.email}</p>
                        </div>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    side={isMobile ? 'bottom' : 'right'}
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                                <AvatarFallback className="rounded-lg">
                                    {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link to="/settings">
                                <BadgeCheckIcon />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setLogoutOpen(true)}>
                        <LogOutIcon />
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                <AlertDialogContent className="max-w-[400px]">
                    <AlertDialogHeader className="flex flex-col items-center text-center pb-4">
                        <AlertDialogTitle className="text-2xl font-bold tracking-tight mb-2">Sign out of your account?</AlertDialogTitle>
                        <AlertDialogDescription className="hidden">Confirm if you want to sign out of your account.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-row gap-3 sm:justify-center mt-2 w-full">
                        <AlertDialogCancel className="w-full sm:w-1/2 m-0 h-11 text-base border-primary text-primary hover:bg-primary/5">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            className="w-full sm:w-1/2 m-0 h-11 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            Yes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
