import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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

function statusVariant(status: ResidentStatus): "success" | "warning" | "destructive" {
    if (status === 'ACTIVE') return 'success'
    if (status === 'DELAYED') return 'warning'
    return 'destructive'
}

function ManagementPage() {
    const [activeTab, setActiveTab] = useState('residents')
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
                    <Badge variant={statusVariant(resident.status)} className="rounded-full px-3 py-1 text-xs font-semibold">
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
                            <Button variant="outline" className="gap-2">
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

            <div className="flex-1 flex flex-col gap-6 w-full">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col w-full min-h-0">
                    <TabsList className="inline-flex w-fit h-10 md:h-12 bg-muted/50 p-1.5 rounded-full overflow-x-auto justify-start border-0">
                        <TabsTrigger value="residents" className="rounded-full px-6 h-full text-sm font-medium">Residents</TabsTrigger>
                        <TabsTrigger value="hubs" className="rounded-full px-6 h-full text-sm font-medium">Hubs</TabsTrigger>
                        <TabsTrigger value="coordinators" className="rounded-full px-6 h-full text-sm font-medium">Coordinators</TabsTrigger>
                    </TabsList>

                    <TabsContent value="residents" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col mt-2">
                        <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-100">
                            <CardContent className="p-4 flex-1 flex flex-col">
                                {isLoading ? (
                                    <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading management data...</div>
                                ) : (
                                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                        <div className="flex-1 overflow-y-auto">
                                            <div className="flex flex-col gap-4 min-h-min">
                                                <DataTable columns={columns} data={residents} noun="residents" emptyIcon={<Eye className="h-6 w-6" />} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="hubs" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col mt-2">
                        <Card className="flex-1 flex items-center justify-center shadow-sm min-h-100 text-muted-foreground">
                            Hubs management coming soon...
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="coordinators" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col mt-2">
                        <Card className="flex-1 flex items-center justify-center shadow-sm min-h-100 text-muted-foreground">
                            Coordinators management coming soon...
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}
