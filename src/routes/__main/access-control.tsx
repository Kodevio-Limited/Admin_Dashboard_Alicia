import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Eye } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table'

import { fetchAccessUsers } from '@/lib/access-control'
import type { AccessUserRow, UserStatus } from '@/lib/access-control'

export const Route = createFileRoute('/__main/access-control')({
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

function statusClasses(status: UserStatus) {
    return status === 'ACTIVE' ? 'bg-[#adfebc] text-[#0a9105]' : 'bg-[#e9e9e9] text-[#686868]'
}

function AccessControlPage() {
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['access-control-users'],
        queryFn: fetchAccessUsers,
    })

    const columns: DataTableColumn<AccessUserRow>[] = useMemo(
        () => [
            {
                key: 'user',
                header: 'USER',
                className: 'font-medium py-4 px-4 text-sm',
                render: (user: AccessUserRow) => <UserProfile {...user} />,
            },
            {
                key: 'role',
                header: 'ROLE',
                className: 'py-4 text-muted-foreground',
                render: (user: AccessUserRow) => user.role,
            },
            {
                key: 'area',
                header: 'ASSIGNED AREA',
                className: 'py-4 text-muted-foreground',
                render: (user: AccessUserRow) => user.area,
            },
            {
                key: 'status',
                header: 'STATUS',
                className: 'py-4',
                render: (user: AccessUserRow) => (
                    <Badge className={`${statusClasses(user.status)} rounded-full px-3 py-1 text-xs font-semibold`}>{user.status}</Badge>
                ),
            },
            {
                key: 'action',
                header: 'ACTION',
                className: 'py-4 text-right pr-4',
                render: (user: AccessUserRow) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-full px-3 py-2 flex items-center gap-2">
                                <Eye className="size-4" />
                                Action
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8}>
                            <DropdownMenuItem onSelect={() => console.log('View', user.name)}>View details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => console.log('Edit', user.name)}>Edit user</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => console.log('Disable', user.name)}>Disable access</DropdownMenuItem>
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
                <Button size="sm">+ Invite User</Button>
            </PageHeader>

            <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-100">
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
        </>
    )
}
