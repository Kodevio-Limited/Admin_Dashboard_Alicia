import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Eye, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/sections/page-header'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table'

import { fetchAccessUsers, updateAccessUser } from '@/lib/access-control'
import type { AccessUserRow, UserStatus } from '@/lib/access-control'

export const Route = createFileRoute('/_authenticated/access-control')({
    component: AccessControlPage,
})
function UserProfile({ name, email, avatar }: { name: string; email: string; avatar: string }) {
    return (
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback>{name}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm text-foreground">{name}</span>
                <span className="text-xs text-muted-foreground">{email}</span>
            </div>
        </div>
    )
}

function statusVariant(status: UserStatus): "success" | "secondary" | "destructive" {
    if (status === 'ACTIVE') return 'success'
    if (status === 'SUSPEND') return 'destructive'
    return 'secondary'
}

function InviteUserDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] p-6 sm:rounded-[32px] gap-6 outline-none" showCloseButton={false}>
                <DialogHeader className="pt-2 text-left">
                    <DialogTitle className="text-2xl font-bold tracking-tight">Invite New User</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-foreground">Full Name</label>
                        <Input placeholder="John Doe" className="bg-[#EEEEEE] border-0 h-12 rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-foreground">Email Address</label>
                        <Input placeholder="john@gmail.com" type="email" className="bg-[#EEEEEE] border-0 h-12 rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-foreground">System Role</label>
                        <Select>
                            <SelectTrigger className="w-full bg-[#EEEEEE] border-0 h-12 rounded-xl text-foreground font-medium">
                                <SelectValue placeholder="Coordinator" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="coordinator">Coordinator</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-foreground">Assign to Area/Hub</label>
                        <Select>
                            <SelectTrigger className="w-full bg-[#EEEEEE] border-0 h-12 rounded-xl text-foreground font-medium">
                                <SelectValue placeholder="Select hub" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="zone-1">Zone 1</SelectItem>
                                <SelectItem value="zone-2">Zone 2</SelectItem>
                                <SelectItem value="zone-3">Zone 3</SelectItem>
                                <SelectItem value="headquarters">Headquarters</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 mb-2">
                        <label className="text-[13px] font-bold text-foreground">Send Welcome Email</label>
                        <Switch className="data-[state=checked]:bg-[#03063A]" defaultChecked />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button 
                        variant="secondary" 
                        className="flex-1"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        className="flex-1"
                        onClick={() => {
                            toast.success('Invitation sent!')
                            onOpenChange(false)
                        }}
                    >
                        Send Invite
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function EditUserDialog({ 
    user, 
    onOpenChange,
    onStatusChange
}: { 
    user: AccessUserRow | null, 
    onOpenChange: (user: AccessUserRow | null) => void,
    onStatusChange: (id: number, status: UserStatus) => void
}) {
    if (!user) return null

    const isActive = user.status === 'ACTIVE'

    return (
        <Dialog open={!!user} onOpenChange={(open) => !open && onOpenChange(null)}>
            <DialogContent className="sm:max-w-[400px] p-6 sm:rounded-[32px] gap-6 outline-none" showCloseButton={false}>
                <div className="absolute top-4 right-4">
                    <Button variant="ghost" size="icon" className="size-8 rounded-full bg-[#E5E5E5] hover:bg-[#D5D5D5]" onClick={() => onOpenChange(null)}>
                        <X className="size-4" />
                    </Button>
                </div>

                <DialogHeader className="flex flex-col items-center gap-1.5 pt-6 pb-2">
                    <div className="relative">
                        <Avatar className="size-24 mb-2">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-2xl">{user.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className={cn(
                            "absolute bottom-3 right-3 size-4 rounded-full border-2 border-white",
                            isActive ? "bg-[#22C55E]" : "bg-[#EF4444]"
                        )} />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">{user.name}</DialogTitle>
                    <p className="text-[13px] font-medium text-muted-foreground">{user.email}</p>
                    <Badge className={cn(
                        "rounded-md px-2 py-0.5 mt-1 border-0 uppercase font-semibold text-[11px] tracking-wider",
                        isActive ? "bg-[#B5F5C6] text-[#0A7B21] hover:bg-[#B5F5C6]" : "bg-[#FECACA] text-[#DC2626] hover:bg-[#FECACA]"
                    )}>
                        {user.status}
                    </Badge>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-foreground">Role Assignment</label>
                        <Select defaultValue={user.role.toLowerCase()}>
                            <SelectTrigger className="w-full bg-[#EEEEEE] border-0 h-11 rounded-xl text-foreground font-medium">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="coordinator">Coordinator</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-foreground">Assign to Area/Hub</label>
                        <Select defaultValue={user.area.toLowerCase()}>
                            <SelectTrigger className="w-full bg-[#EEEEEE] border-0 h-11 rounded-xl text-foreground font-medium">
                                <SelectValue placeholder="Search hub" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="zone-1">Zone 1</SelectItem>
                                <SelectItem value="zone-2">Zone 2</SelectItem>
                                <SelectItem value="zone-3">Zone 3</SelectItem>
                                <SelectItem value="headquarters">Headquarters</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-foreground">Last Login</label>
                        <Input value="4:40 PM" readOnly className="bg-[#EEEEEE] border-0 h-11 rounded-xl text-muted-foreground font-medium" />
                    </div>

                    {!isActive && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-foreground">Suspended By</label>
                            <Input value="Omar Symister" readOnly className="bg-[#EEEEEE] border-0 h-11 rounded-xl text-muted-foreground font-medium" />
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-4">
                    {isActive ? (
                        <Button 
                            variant="destructive"
                            className="flex-1"
                            onClick={() => {
                                onStatusChange(user.id, 'SUSPEND')
                                onOpenChange(null)
                            }}
                        >
                            Suspend User
                        </Button>
                    ) : (
                        <Button 
                            className="flex-1"
                            onClick={() => {
                                onStatusChange(user.id, 'ACTIVE')
                                onOpenChange(null)
                            }}
                        >
                            Unsuspend User
                        </Button>
                    )}
                    <Button 
                        className="flex-1"
                        onClick={() => {
                            toast.success('Changes saved')
                            onOpenChange(null)
                        }}
                    >
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function AccessControlPage() {
    const queryClient = useQueryClient()
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<AccessUserRow | null>(null)

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['access-control-users'],
        queryFn: fetchAccessUsers,
    })

    const handleStatusChange = (id: number, status: UserStatus) => {
        updateAccessUser(id, { status })
        queryClient.invalidateQueries({ queryKey: ['access-control-users'] })
        toast.success(`User status changed to ${status}`)
    }

    const columns: DataTableColumn<AccessUserRow>[] = useMemo(
        () => [
            {
                key: 'user',
                header: 'USER',
                className: 'font-medium py-2 px-2 text-sm',
                render: (user: AccessUserRow) => <UserProfile {...user} />,
            },
            {
                key: 'role',
                header: 'ROLE',
                className: 'py-2 text-muted-foreground text-left',
                headerClassName: 'text-left',
                render: (user: AccessUserRow) => user.role,
            },
            {
                key: 'area',
                header: 'ASSIGNED AREA',
                className: 'py-2 text-muted-foreground text-left',
                headerClassName: 'text-left',
                render: (user: AccessUserRow) => user.area,
            },
            {
                key: 'status',
                header: 'STATUS',
                className: 'py-2 text-left',
                headerClassName: 'text-left',
                render: (user: AccessUserRow) => (
                    <Badge variant={statusVariant(user.status)} className="rounded-full px-3 py-1 text-xs font-semibold">{user.status}</Badge>
                ),
            },
            {
                key: 'action',
                header: 'ACTION',
                className: 'py-2 text-left pr-4',
                headerClassName: 'text-left pr-4',
                render: (user: AccessUserRow) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Eye className="size-4" />
                                Action
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8}>
                            <DropdownMenuItem onSelect={() => setEditingUser(user)}>View details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setEditingUser(user)}>Edit user</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleStatusChange(user.id, user.status === 'ACTIVE' ? 'SUSPEND' : 'ACTIVE')}>
                                {user.status === 'ACTIVE' ? 'Suspend access' : 'Activate access'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [],
    )

    return (
        <>
            <PageHeader title="Access Control" description="Manage users, roles, and system permissions" lastUpdated="05:41:15 PM">
                <Button variant="default" onClick={() => setIsInviteOpen(true)}>+ Invite User</Button>
            </PageHeader>

            <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-0">
                <CardContent className="p-4 flex-1 flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading access control data...</div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-4">
                            <DataTable columns={columns} data={users} noun="users" emptyIcon={<Eye className="h-6 w-6" />} />
                        </div>
                    )}
                </CardContent>
            </Card>

            <InviteUserDialog open={isInviteOpen} onOpenChange={setIsInviteOpen} />
            <EditUserDialog user={editingUser} onOpenChange={setEditingUser} onStatusChange={handleStatusChange} />
        </>
    )
}
