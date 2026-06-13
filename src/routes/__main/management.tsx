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

import { fetchResidents } from '@/lib/management'
import type { ResidentRow, ResidentStatus } from '@/lib/management'

export const Route = createFileRoute('/__main/management')({
    component: ManagementPage,
})
function ResidentProfile({ name, email, avatar }: { name: string; email: string; avatar: string }) {
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

function statusClasses(status: ResidentStatus) {
    if (status === 'ACTIVE') return 'bg-[#adfebc] text-[#0a9105]'
    if (status === 'DELAYED') return 'bg-[#fef2c3] text-[#d29d08]'
    return 'bg-[#feadad] text-[#910000]'
}

function ManagementPage() {
    const { data: residents = [], isLoading } = useQuery({
        queryKey: ['management-residents'],
        queryFn: fetchResidents,
    })

    const columns: DataTableColumn<ResidentRow>[] = useMemo(
        () => [
            {
                key: 'user',
                header: 'RESIDENTS',
                className: 'font-medium py-4 px-4 text-sm',
                render: (resident: ResidentRow) => <ResidentProfile {...resident} />,
            },
            {
                key: 'community',
                header: 'COMMUNITY',
                className: 'py-4 text-muted-foreground',
                render: (resident: ResidentRow) => resident.community,
            },
            {
                key: 'lastCheckIn',
                header: 'LAST CHECK IN',
                className: 'py-4',
                render: (resident: ResidentRow) => resident.lastCheckIn,
            },
            {
                key: 'status',
                header: 'STATUS',
                className: 'py-4',
                render: (resident: ResidentRow) => (
                    <Badge className={`${statusClasses(resident.status)} rounded-full px-3 py-1 text-xs font-semibold`}>
                        {resident.status}
                    </Badge>
                ),
            },
            {
                key: 'action',
                header: 'ACTION',
                className: 'py-4 text-right pr-4',
                render: (resident: ResidentRow) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-full px-3 py-2 flex items-center gap-2">
                                <Eye className="size-4" />
                                Action
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8}>
                            <DropdownMenuItem onSelect={() => console.log('View', resident.name)}>View details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => console.log('Edit', resident.name)}>Edit resident</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => console.log('Message', resident.name)}>Send message</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [],
    )

    return (
        <>
            <PageHeader title="Management" description="Manage residents, hubs, and coordinators" lastUpdated="05:41:15 PM" />

            <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-100">
                <CardContent className="p-4 flex-1 flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading management data...</div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-4">
                            <DataTable columns={columns} data={residents} noun="residents" emptyIcon={<Eye className="h-6 w-6" />} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    )
}
