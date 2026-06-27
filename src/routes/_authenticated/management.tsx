import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Eye } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/sections/page-header'
import { ServerDataTable } from '@/components/shared/server-data-table'
import { type HubAPIResult, type CoordinatorAPIResult } from '@/lib/api/management'
import { useResidents, useHubs, useCoordinators } from '@/hooks/use-management'
import { residentColumns, hubColumns, coordinatorColumns, CreateHubDialog, AssignCoordinatorDialog } from '@/features/management'

export const Route = createFileRoute('/_authenticated/management')({
    component: ManagementPage,
})

function ManagementPage() {
    const [activeTab, setActiveTab] = useState('residents')

    const [residentPage, setResidentPage] = useState(1)
    const [residentLimit, setResidentLimit] = useState(10)
    const [residentSearch] = useState('')

    const { data: residentsData, isLoading: isLoadingResidents } = useResidents({
        page: residentPage,
        limit: residentLimit,
        search: residentSearch || undefined,
    })

    const [hubPage, setHubPage] = useState(1)
    const [hubLimit, setHubLimit] = useState(10)
    const [hubSearch] = useState('')

    const { data: hubsData, isLoading: isLoadingHubs } = useHubs({
        page: hubPage,
        limit: hubLimit,
        search: hubSearch || undefined,
    })

    const [coordinatorPage, setCoordinatorPage] = useState(1)
    const [coordinatorLimit, setCoordinatorLimit] = useState(10)
    const [coordinatorSearch] = useState('')

    const { data: coordinatorsData, isLoading: isLoadingCoordinators } = useCoordinators({
        page: coordinatorPage,
        limit: coordinatorLimit,
        search: coordinatorSearch || undefined,
    })

    return (
        <>
            <PageHeader title="Management" description="Manage residents, hubs, and coordinators" lastUpdated="05:41:15 PM" />

            <div className="flex-1 flex flex-col w-full">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col w-full min-h-0">
                    <div className="flex items-center justify-between w-full">
                        <TabsList className="inline-flex w-fit h-10 md:h-12 bg-muted p-1.5 rounded-full overflow-x-auto justify-start border-0">
                            <TabsTrigger
                                value="residents"
                                className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
                            >
                                Residents
                            </TabsTrigger>
                            <TabsTrigger
                                value="hubs"
                                className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
                            >
                                Hubs
                            </TabsTrigger>
                            <TabsTrigger
                                value="coordinators"
                                className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
                            >
                                Coordinators
                            </TabsTrigger>
                        </TabsList>

                        {activeTab === 'hubs' && <CreateHubDialog />}
                        {activeTab === 'coordinators' && <AssignCoordinatorDialog />}
                    </div>

                    <TabsContent value="residents" className="rounded-[12px] outline-none flex-1 data-[state=active]:flex flex-col mt-0">
                        <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-100">
                            <CardContent className="p-4 pb-[6px] flex-1 flex flex-col">
                                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                    <div className="flex-1 overflow-y-auto">
                                        <div className="flex flex-col gap-4 min-h-min">
                                            <ServerDataTable
                                                columns={residentColumns}
                                                data={residentsData?.results || []}
                                                noun="residents"
                                                emptyIcon={<Eye className="h-6 w-6" />}
                                                totalCount={residentsData?.count || 0}
                                                page={residentPage}
                                                limit={residentLimit}
                                                onPageChange={setResidentPage}
                                                onLimitChange={setResidentLimit}
                                                isLoading={isLoadingResidents}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="hubs" className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col mt-0">
                        <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-0">
                            <CardContent className="p-4 pb-[6px] flex-1 flex flex-col">
                                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                    <div className="flex-1 overflow-y-auto">
                                        <div className="flex flex-col gap-4 min-h-min">
                                            <ServerDataTable<HubAPIResult>
                                                columns={hubColumns}
                                                data={hubsData?.results || ([] as HubAPIResult[])}
                                                totalCount={hubsData?.count || 0}
                                                page={hubPage}
                                                limit={hubLimit}
                                                onPageChange={setHubPage}
                                                onLimitChange={setHubLimit}
                                                isLoading={isLoadingHubs}
                                                noun="hubs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent
                        value="coordinators"
                        className="m-0 border-0 p-0 outline-none flex-1 data-[state=active]:flex flex-col mt-0"
                    >
                        <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-0">
                            <CardContent className="p-4 pb-[6px] flex-1 flex flex-col">
                                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                    <div className="flex-1 overflow-y-auto">
                                        <div className="flex flex-col gap-4 min-h-min">
                                            <ServerDataTable<CoordinatorAPIResult>
                                                columns={coordinatorColumns}
                                                data={coordinatorsData?.results || ([] as CoordinatorAPIResult[])}
                                                totalCount={coordinatorsData?.count || 0}
                                                page={coordinatorPage}
                                                limit={coordinatorLimit}
                                                onPageChange={setCoordinatorPage}
                                                onLimitChange={setCoordinatorLimit}
                                                isLoading={isLoadingCoordinators}
                                                noun="coordinators"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}
