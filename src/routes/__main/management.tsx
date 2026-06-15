import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Eye } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/sections/page-header'
import { DataTable } from '@/components/ui/data-table'
import { fetchResidents, fetchHubs, fetchCoordinators } from '@/lib/management'
import {
    residentColumns,
    hubColumns,
    coordinatorColumns,
    CreateHubDialog,
    AssignCoordinatorDialog,
} from '@/features/management'

export const Route = createFileRoute('/__main/management')({
    component: ManagementPage,
})

function ManagementPage() {
    const [activeTab, setActiveTab] = useState('residents')

    const { data: residents = [], isLoading } = useQuery({
        queryKey: ['management-residents'],
        queryFn: fetchResidents,
    })
    const { data: hubs = [], isLoading: isLoadingHubs } = useQuery({
        queryKey: ['management-hubs'],
        queryFn: fetchHubs,
    })
    const { data: coordinators = [], isLoading: isLoadingCoordinators } = useQuery({
        queryKey: ['management-coordinators'],
        queryFn: fetchCoordinators,
    })

    return (
        <>
            <PageHeader title="Management" description="Manage residents, hubs, and coordinators" lastUpdated="05:41:15 PM" />

            <div className="flex-1 flex flex-col w-full">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col w-full min-h-0">
                    <div className="flex items-center justify-between w-full">
                        <TabsList className="inline-flex w-fit h-10 md:h-12 bg-[#DFDFDF] p-1.5 rounded-full overflow-x-auto justify-start border-0">
                            <TabsTrigger value="residents" className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#03063A] data-[state=active]:shadow-sm text-[#737373] transition-all">Residents</TabsTrigger>
                            <TabsTrigger value="hubs" className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#03063A] data-[state=active]:shadow-sm text-[#737373] transition-all">Hubs</TabsTrigger>
                            <TabsTrigger value="coordinators" className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#03063A] data-[state=active]:shadow-sm text-[#737373] transition-all">Coordinators</TabsTrigger>
                        </TabsList>

                        {activeTab === 'hubs' && <CreateHubDialog />}
                        {activeTab === 'coordinators' && <AssignCoordinatorDialog />}
                    </div>

                    <TabsContent value="residents" className="rounded-[12px] outline-none flex-1 data-[state=active]:flex flex-col mt-0">
                        <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-100">
                            <CardContent className="p-4 pb-[6px] flex-1 flex flex-col">
                                {isLoading ? (
                                    <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading management data...</div>
                                ) : (
                                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                        <div className="flex-1 overflow-y-auto">
                                            <div className="flex flex-col gap-4 min-h-min">
                                                <DataTable columns={residentColumns} data={residents} noun="residents" emptyIcon={<Eye className="h-6 w-6" />} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="hubs" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col mt-0">
                        <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-0">
                            <CardContent className="p-4 pb-[6px] flex-1 flex flex-col">
                                {isLoadingHubs ? (
                                    <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading hubs data...</div>
                                ) : (
                                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                        <div className="flex-1 overflow-y-auto">
                                            <div className="flex flex-col gap-4 min-h-min">
                                                <DataTable columns={hubColumns} data={hubs} noun="hubs" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="coordinators" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col mt-0">
                        <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-0">
                            <CardContent className="p-4 pb-[6px] flex-1 flex flex-col">
                                {isLoadingCoordinators ? (
                                    <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading coordinators data...</div>
                                ) : (
                                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                        <div className="flex-1 overflow-y-auto">
                                            <div className="flex flex-col gap-4 min-h-min">
                                                <DataTable columns={coordinatorColumns} data={coordinators} noun="coordinators" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}
