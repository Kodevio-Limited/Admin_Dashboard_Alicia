import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState, useEffect } from 'react'
import { Eye, X, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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

import { useUsers, useActivateResident, useSuspendResident, useUpdateUser } from '@/hooks/use-management'
import type { UserAPIResult } from '@/lib/api/management'

export const Route = createFileRoute('/_authenticated/access-control')({
    component: AccessControlPage,
})

function UserProfile({ name, email }: { name: string; email: string }) {
    return (
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarFallback className="font-semibold bg-muted-foreground/10 flex items-center justify-center rounded-full size-10">
                    {name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm text-foreground">{name}</span>
                <span className="text-xs text-muted-foreground">{email}</span>
            </div>
        </div>
    )
}

function InviteUserDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] p-6 sm:rounded-[32px] gap-6 outline-none" showCloseButton={false}>
                <DialogHeader className="pt-2 text-left">
                    <DialogTitle className="text-2xl font-bold tracking-tight">Invite New User</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-foreground">Full Name</label>
                        <Input
                            placeholder="John Doe"
                            className="bg-secondary border-0 h-12 rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-foreground">Email Address</label>
                        <Input
                            placeholder="john@gmail.com"
                            type="email"
                            className="bg-secondary border-0 h-12 rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-foreground">System Role</label>
                        <Select>
                            <SelectTrigger className="w-full bg-secondary border-0 h-12 rounded-xl text-foreground font-medium">
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
                            <SelectTrigger className="w-full bg-secondary border-0 h-12 rounded-xl text-foreground font-medium">
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
                        <Switch className="data-[state=checked]:bg-primary" defaultChecked />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
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

interface EditUserDialogProps {
    user: UserAPIResult | null
    mode: 'view' | 'edit'
    onOpenChange: (user: UserAPIResult | null) => void
    onStatusChange: (phone: string, active: boolean) => void
    onSaveChanges: (phone: string, role: string) => void
}

function EditUserDialog({ user, mode, onOpenChange, onStatusChange, onSaveChanges }: EditUserDialogProps) {
    const [selectedRole, setSelectedRole] = useState('')

    useEffect(() => {
        if (user) {
            setSelectedRole(user.role.toLowerCase())
        }
    }, [user])

    if (!user) return null

    const isActive = user.is_active

    return (
        <Dialog open={!!user} onOpenChange={(open) => !open && onOpenChange(null)}>
            <DialogContent className="sm:max-w-[400px] p-6 sm:rounded-[32px] gap-6 outline-none" showCloseButton={false}>
                <div className="absolute top-4 right-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full bg-[#E5E5E5] hover:bg-[#D5D5D5]"
                        onClick={() => onOpenChange(null)}
                    >
                        <X className="size-4" />
                    </Button>
                </div>

                <DialogHeader className="flex flex-col items-center gap-1.5 pt-6 pb-2">
                    <div className="relative">
                        <Avatar className="size-24 mb-2">
                            <AvatarFallback className="text-2xl font-bold bg-muted flex items-center justify-center rounded-full size-24">
                                {user.full_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div
                            className={cn(
                                'absolute bottom-3 right-3 size-4 rounded-full border-2 border-white',
                                isActive ? 'bg-[#22C55E]' : 'bg-[#EF4444]',
                            )}
                        />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">{user.full_name}</DialogTitle>
                    <p className="text-[13px] font-medium text-muted-foreground">{user.email || user.phone_number}</p>
                    <Badge
                        className={cn(
                            'rounded-md px-2 py-0.5 mt-1 border-0 uppercase font-semibold text-[11px] tracking-wider',
                            isActive ? 'bg-[#B5F5C6] text-[#0A7B21] hover:bg-[#B5F5C6]' : 'bg-[#FECACA] text-[#DC2626] hover:bg-[#FECACA]',
                        )}
                    >
                        {isActive ? 'ACTIVE' : 'SUSPENDED'}
                    </Badge>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-foreground">Role Assignment</label>
                        <Select value={selectedRole} onValueChange={setSelectedRole} disabled={mode === 'view'}>
                            <SelectTrigger className="w-full bg-[#EEEEEE] border-0 h-11 rounded-xl text-foreground font-medium disabled:opacity-80">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-md">
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="coordinator">Coordinator</SelectItem>
                                <SelectItem value="government">Government</SelectItem>
                                <SelectItem value="resident">Resident</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-foreground">Assign to Area/Hub</label>
                        <Input
                            value={user.hub_name || 'Unassigned'}
                            readOnly
                            className="bg-[#EEEEEE] border-0 h-11 rounded-xl text-muted-foreground font-medium"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-foreground">Phone Number</label>
                        <Input
                            value={user.phone_number}
                            readOnly
                            className="bg-[#EEEEEE] border-0 h-11 rounded-xl text-muted-foreground font-medium"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-4">
                    {mode === 'edit' ? (
                        <>
                            <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(null)}>
                                Cancel
                            </Button>
                            <Button className="flex-1" onClick={() => onSaveChanges(user.phone_number, selectedRole)}>
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <>
                            {isActive ? (
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => {
                                        onStatusChange(user.phone_number, false)
                                        onOpenChange(null)
                                    }}
                                >
                                    Suspend User
                                </Button>
                            ) : (
                                <Button
                                    className="flex-1"
                                    onClick={() => {
                                        onStatusChange(user.phone_number, true)
                                        onOpenChange(null)
                                    }}
                                >
                                    Unsuspend User
                                </Button>
                            )}
                            <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(null)}>
                                Close
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function AccessControlPage() {
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UserAPIResult | null>(null)
    const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view')

    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')

    const { data: usersData, isLoading } = useUsers({
        search: search || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        is_active: statusFilter === 'active' ? true : statusFilter === 'suspended' ? false : undefined,
        limit: 100,
    })
    const usersList = usersData?.results || []

    const activateMutation = useActivateResident()
    const suspendMutation = useSuspendResident()
    const updateUserMutation = useUpdateUser()

    const handleStatusChange = (phone: string, active: boolean) => {
        if (active) {
            activateMutation.mutate(phone, {
                onSuccess: () => toast.success('User access activated successfully'),
                onError: (err: any) => toast.error(err?.message || 'Failed to activate user'),
            })
        } else {
            suspendMutation.mutate(phone, {
                onSuccess: () => toast.success('User access suspended successfully'),
                onError: (err: any) => toast.error(err?.message || 'Failed to suspend user'),
            })
        }
    }

    const handleSaveChanges = (phone: string, role: string) => {
        updateUserMutation.mutate(
            { phone, role },
            {
                onSuccess: () => {
                    toast.success('User role updated successfully')
                    setEditingUser(null)
                },
                onError: (err: any) => {
                    toast.error(err?.message || 'Failed to update user role')
                },
            },
        )
    }

    const columns: DataTableColumn<UserAPIResult>[] = useMemo(
        () => [
            {
                key: 'user',
                header: 'USER',
                className: 'font-medium py-2 px-2 text-sm',
                render: (user: UserAPIResult) => <UserProfile name={user.full_name} email={user.email || user.phone_number} />,
            },
            {
                key: 'role',
                header: 'ROLE',
                className: 'py-2 text-muted-foreground text-left uppercase text-xs font-semibold',
                headerClassName: 'text-left',
                render: (user: UserAPIResult) => user.role,
            },
            {
                key: 'area',
                header: 'ASSIGNED AREA/HUB',
                className: 'py-2 text-muted-foreground text-left text-sm',
                headerClassName: 'text-left',
                render: (user: UserAPIResult) => user.hub_name || 'Unassigned',
            },
            {
                key: 'status',
                header: 'STATUS',
                className: 'py-2 text-left',
                headerClassName: 'text-left',
                render: (user: UserAPIResult) => (
                    <Badge variant={user.is_active ? 'success' : 'destructive'} className="rounded-full px-3 py-1 text-xs font-semibold">
                        {user.is_active ? 'ACTIVE' : 'SUSPENDED'}
                    </Badge>
                ),
            },
            {
                key: 'action',
                header: 'ACTION',
                className: 'py-2 text-left pr-4',
                headerClassName: 'text-left pr-4',
                render: (user: UserAPIResult) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Eye className="size-4 mr-2" />
                                Action
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8}>
                            <DropdownMenuItem
                                onSelect={() => {
                                    setEditingUser(user)
                                    setDialogMode('view')
                                }}
                            >
                                View details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={() => {
                                    setEditingUser(user)
                                    setDialogMode('edit')
                                }}
                            >
                                Edit user
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() =>
                                    user.is_active
                                        ? suspendMutation.mutate(user.phone_number, {
                                              onSuccess: () => toast.success(`User ${user.full_name} suspended`),
                                              onError: (err: any) => toast.error(err?.message || 'Failed to suspend user'),
                                          })
                                        : activateMutation.mutate(user.phone_number, {
                                              onSuccess: () => toast.success(`User ${user.full_name} activated`),
                                              onError: (err: any) => toast.error(err?.message || 'Failed to activate user'),
                                          })
                                }
                            >
                                {user.is_active ? 'Suspend access' : 'Activate access'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [suspendMutation, activateMutation],
    )

    return (
        <>
            <PageHeader
                title="Access Control"
                description="Manage users, roles, and system permissions"
                lastUpdated="05:41:15 PM"
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search users..."
            >
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-9 rounded-full px-4 gap-2 text-xs font-semibold text-muted-foreground border-black/5 bg-white shadow-sm hover:bg-slate-50"
                        >
                            <SlidersHorizontal className="size-3.5" />
                            Filter
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 rounded-2xl p-4 flex flex-col gap-4 border shadow-xl bg-white" align="end">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">Filters</h3>
                            {(roleFilter !== 'all' || statusFilter !== 'all') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setRoleFilter('all')
                                        setStatusFilter('all')
                                    }}
                                    className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
                                >
                                    Clear all
                                </Button>
                            )}
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Role</label>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="h-10 rounded-lg bg-muted/40 border-none shadow-none text-sm">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-md">
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="coordinator">Coordinator</SelectItem>
                                        <SelectItem value="government">Government</SelectItem>
                                        <SelectItem value="resident">Resident</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Status</label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-10 rounded-lg bg-muted/40 border-none shadow-none text-sm">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-md">
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Button variant="default" onClick={() => setIsInviteOpen(true)}>
                    + Invite User
                </Button>
            </PageHeader>

            <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-0">
                <CardContent className="p-4 flex-1 flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading access control data...</div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-4">
                            <DataTable columns={columns} data={usersList} noun="users" emptyIcon={<Eye className="h-6 w-6" />} />
                        </div>
                    )}
                </CardContent>
            </Card>

            <InviteUserDialog open={isInviteOpen} onOpenChange={setIsInviteOpen} />
            <EditUserDialog
                user={editingUser}
                mode={dialogMode}
                onOpenChange={setEditingUser}
                onStatusChange={handleStatusChange}
                onSaveChanges={handleSaveChanges}
            />
        </>
    )
}
