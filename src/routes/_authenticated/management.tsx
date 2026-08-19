import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Users, Building2, UserCheck, Eye, SlidersHorizontal } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/sections/page-header'
import { ServerDataTable } from '@/components/shared/server-data-table'
import { type HubAPIResult, type CoordinatorAPIResult } from '@/lib/api/management'
import { useResidents, useHubs, useCoordinators } from '@/hooks/use-management'
import { residentColumns, hubColumns, coordinatorColumns, CreateHubDialog, AssignCoordinatorDialog } from '@/features/management'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

export const Route = createFileRoute('/_authenticated/management')({
    component: ManagementPage,
})

function ManagementPage() {
    const initialTab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') || 'residents' : 'residents'
    const [activeTab, setActiveTab] = useState(initialTab)

    const [residentPage, setResidentPage] = useState(1)
    const [residentLimit, setResidentLimit] = useState(10)
    const initialSearch = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('search') || '' : ''

    const [residentSearch, setResidentSearch] = useState(initialSearch)
    const [residentHubId, setResidentHubId] = useState<string>('all')
    const [residentIsActive, setResidentIsActive] = useState<string>('all')

    const { data: filterHubsData } = useHubs({ limit: 100 })

    const { data: residentsData, isLoading: isLoadingResidents } = useResidents({
        page: residentPage,
        limit: residentLimit,
        search: residentSearch || undefined,
        hub_id: residentHubId !== 'all' ? Number(residentHubId) : undefined,
        is_active: residentIsActive !== 'all' ? residentIsActive === 'active' : undefined,
    })

    const [hubPage, setHubPage] = useState(1)
    const [hubLimit, setHubLimit] = useState(10)
    const [hubSearch, setHubSearch] = useState(initialSearch)
    const [hubStatus, setHubStatus] = useState<string>('all')

    const { data: hubsData, isLoading: isLoadingHubs } = useHubs({
        page: hubPage,
        limit: hubLimit,
        search: hubSearch || undefined,
        status: hubStatus !== 'all' ? hubStatus : undefined,
    })

    const [coordinatorPage, setCoordinatorPage] = useState(1)
    const [coordinatorLimit, setCoordinatorLimit] = useState(10)
    const [coordinatorSearch, setCoordinatorSearch] = useState(initialSearch)
    const [coordinatorHubId, setCoordinatorHubId] = useState<string>('all')
    const [coordinatorIsActive, setCoordinatorIsActive] = useState<string>('all')

    const { data: coordinatorsData, isLoading: isLoadingCoordinators } = useCoordinators({
        page: coordinatorPage,
        limit: coordinatorLimit,
        search: coordinatorSearch || undefined,
        hub_id: coordinatorHubId !== 'all' ? Number(coordinatorHubId) : undefined,
        is_active: coordinatorIsActive !== 'all' ? coordinatorIsActive === 'active' : undefined,
    })

    const activeSearchValue = activeTab === 'residents' ? residentSearch : activeTab === 'hubs' ? hubSearch : coordinatorSearch

    const handleSearchChange = (val: string) => {
        if (activeTab === 'residents') {
            setResidentSearch(val)
            setResidentPage(1)
        } else if (activeTab === 'hubs') {
            setHubSearch(val)
            setHubPage(1)
        } else if (activeTab === 'coordinators') {
            setCoordinatorSearch(val)
            setCoordinatorPage(1)
        }
    }

    return (
        <>
            <PageHeader
                title="Management"
                description="Manage residents, hubs, and coordinators"
                lastUpdated="05:41:15 PM"
                searchValue={activeSearchValue}
                onSearchChange={handleSearchChange}
                searchPlaceholder={
                    activeTab === 'residents' ? 'Search residents...' : activeTab === 'hubs' ? 'Search hubs...' : 'Search coordinators...'
                }
            >
                {activeTab === 'residents' && (
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
                                {(residentHubId !== 'all' || residentIsActive !== 'all') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setResidentHubId('all')
                                            setResidentIsActive('all')
                                            setResidentPage(1)
                                        }}
                                        className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
                                    >
                                        Clear all
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Hub</label>
                                    <Select
                                        value={residentHubId}
                                        onValueChange={(val) => {
                                            setResidentHubId(val)
                                            setResidentPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg bg-muted/40 border-none shadow-none text-sm">
                                            <SelectValue placeholder="All Hubs" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-md">
                                            <SelectItem value="all">All Hubs</SelectItem>
                                            {filterHubsData?.results?.map((hub) => (
                                                <SelectItem key={hub.id} value={hub.id.toString()}>
                                                    {hub.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                                    <Select
                                        value={residentIsActive}
                                        onValueChange={(val) => {
                                            setResidentIsActive(val)
                                            setResidentPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg bg-muted/40 border-none shadow-none text-sm">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-md">
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}

                {activeTab === 'hubs' && (
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
                                {hubStatus !== 'all' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setHubStatus('all')
                                            setHubPage(1)
                                        }}
                                        className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
                                    >
                                        Clear all
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                                    <Select
                                        value={hubStatus}
                                        onValueChange={(val) => {
                                            setHubStatus(val)
                                            setHubPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg bg-muted/40 border-none shadow-none text-sm">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-md">
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                            <SelectItem value="low_battery">Low Battery</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}

                {activeTab === 'coordinators' && (
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
                                {(coordinatorHubId !== 'all' || coordinatorIsActive !== 'all') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setCoordinatorHubId('all')
                                            setCoordinatorIsActive('all')
                                            setCoordinatorPage(1)
                                        }}
                                        className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
                                    >
                                        Clear all
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Hub</label>
                                    <Select
                                        value={coordinatorHubId}
                                        onValueChange={(val) => {
                                            setCoordinatorHubId(val)
                                            setCoordinatorPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg bg-muted/40 border-none shadow-none text-sm">
                                            <SelectValue placeholder="All Hubs" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-md">
                                            <SelectItem value="all">All Hubs</SelectItem>
                                            {filterHubsData?.results?.map((hub) => (
                                                <SelectItem key={hub.id} value={hub.id.toString()}>
                                                    {hub.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                                    <Select
                                        value={coordinatorIsActive}
                                        onValueChange={(val) => {
                                            setCoordinatorIsActive(val)
                                            setCoordinatorPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg bg-muted/40 border-none shadow-none text-sm">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-md">
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </PageHeader>

            <div className="flex-1 flex flex-col w-full">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col w-full min-h-0">
                    <div className="flex items-center justify-between w-full">
                        <TabsList className="inline-flex w-fit h-10 md:h-12 bg-muted p-1.5 rounded-full overflow-x-auto justify-start border-0">
                            <TabsTrigger
                                value="residents"
                                className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
                            >
                                <Users className="size-[15px] shrink-0 mr-1.5" />
                                Residents
                            </TabsTrigger>
                            <TabsTrigger
                                value="hubs"
                                className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
                            >
                                <Building2 className="size-[15px] shrink-0 mr-1.5" />
                                Hubs
                            </TabsTrigger>
                            <TabsTrigger
                                value="coordinators"
                                className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
                            >
                                <UserCheck className="size-[15px] shrink-0 mr-1.5" />
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
                                                onReset={() => {
                                                    setResidentSearch('')
                                                    setResidentHubId('all')
                                                    setResidentIsActive('all')
                                                    setResidentPage(1)
                                                }}
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
                                                onReset={() => {
                                                    setHubSearch('')
                                                    setHubStatus('all')
                                                    setHubPage(1)
                                                }}
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
                                                onReset={() => {
                                                    setCoordinatorSearch('')
                                                    setCoordinatorHubId('all')
                                                    setCoordinatorIsActive('all')
                                                    setCoordinatorPage(1)
                                                }}
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
