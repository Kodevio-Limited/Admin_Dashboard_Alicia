import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Eye, Plus, Ban, Clock, MapPin, BadgeCheck, Search, Battery, Wifi, Users, Edit, Activity } from 'lucide-react'
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
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/sections/page-header'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { fetchResidents, fetchHubs, fetchCoordinators } from '@/lib/management'
import type { ResidentRow, ResidentStatus, HubRow, CoordinatorRow } from '@/lib/management'

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

function ResidentActionCell({ resident }: { resident: ResidentRow }) {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Eye className="size-4 mr-2" />
                        Action
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8}>
                    <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>View details</DropdownMenuItem>
                    </DialogTrigger>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => console.log('Edit', resident.name)}>Edit resident</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => console.log('Message', resident.name)}>Send message</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-lg rounded-[24px]">
                <div className="flex flex-col items-center pt-10 pb-4 px-6">
                    <div className="relative mb-4">
                        <Avatar className="size-24 md:size-32">
                            <AvatarImage src={resident.avatar} />
                            <AvatarFallback className="text-3xl bg-muted">{resident.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {resident.status === 'ACTIVE' && (
                            <div className="absolute bottom-1.5 right-1.5 size-6 bg-[#34D399] rounded-full border-4 border-white" />
                        )}
                    </div>
                    <h2 className="text-2xl font-medium mb-3 text-foreground">{resident.name}</h2>
                    <Badge variant={statusVariant(resident.status)} className={`uppercase px-4 py-1 tracking-wider text-xs font-medium ${resident.status === 'ACTIVE' ? 'bg-[#99F6E4]/50 text-[#16A34A] hover:bg-[#99F6E4]/50' : ''}`}>
                        {resident.status}
                    </Badge>
                </div>

                <div className="px-6 pb-6 w-full flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground font-medium">Location & Status</p>
                    <div className="bg-[#F3F4F6] rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="size-[18px]" />
                                <span>Community</span>
                            </div>
                            <span className="font-medium text-foreground">{resident.community}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="size-[18px]" />
                                <span>Last Check In</span>
                            </div>
                            <span className="font-medium text-[#16A34A]">{resident.lastCheckIn}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-8 mt-12 md:mt-24">
                    <Button variant="destructive" className="w-full">
                        <Ban className="mr-2" />
                        Suspend Account
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function HubActionCell({ hub }: { hub: HubRow }) {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Eye className="size-4 mr-2" />
                        Action
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8}>
                    <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>View details</DropdownMenuItem>
                    </DialogTrigger>
                    <DropdownMenuSeparator />
                    <CreateHubDialog mode="edit" hub={hub}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit hub</DropdownMenuItem>
                    </CreateHubDialog>
                    <DropdownMenuItem onSelect={() => console.log('Restart', hub.name)}>Restart hub</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-md p-6 md:p-8 overflow-hidden border-none shadow-lg rounded-[24px]">
                <div className="flex flex-col items-center pt-2 pb-6 px-2">
                    <h2 className="text-2xl font-bold mb-3 text-foreground">{hub.name}</h2>
                    <Badge variant={hub.status === 'ONLINE' ? 'success' : 'destructive'} className={`uppercase px-4 py-1 tracking-wider text-xs font-medium ${hub.status === 'ONLINE' ? 'bg-[#99F6E4]/50 text-[#16A34A] hover:bg-[#99F6E4]/50' : ''}`}>
                        {hub.status}
                    </Badge>
                </div>

                <div className="w-full flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground font-medium">Hub Telemetry</p>
                    <div className="bg-[#F3F4F6] rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="size-[18px]" />
                                <span>Location</span>
                            </div>
                            <span className="font-medium text-foreground">{hub.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Battery className="size-[18px]" />
                                <span>Battery</span>
                            </div>
                            <span className="font-medium text-foreground">85%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Wifi className="size-[18px]" />
                                <span>Satellite Intenet</span>
                            </div>
                            <span className="font-medium text-foreground">Active</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="size-[18px]" />
                                <span>Linked Residents</span>
                            </div>
                            <span className="font-medium text-foreground">1250</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="size-[18px]" />
                                <span>Last Sync</span>
                            </div>
                            <span className="font-medium text-[#16A34A]">{hub.lastSync}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                    <AssignCoordinatorDialog>
                        <Button className="w-full">
                            Assign Coordinator
                        </Button>
                    </AssignCoordinatorDialog>
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1" >
                            Restart Sync Service
                        </Button>
                        <CreateHubDialog mode="edit" hub={hub}>
                            <Button variant="secondary" className='flex-1'>
                                Edit
                            </Button>
                        </CreateHubDialog>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function CoordinatorActionCell({ coordinator }: { coordinator: CoordinatorRow }) {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Eye className="size-4 mr-2" />
                        Action
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8}>
                    <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>View details</DropdownMenuItem>
                    </DialogTrigger>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => console.log('Edit', coordinator.name)}>Edit coordinator</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => console.log('Message', coordinator.name)}>Send message</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-lg rounded-[24px]">
                <div className="flex flex-col items-center pt-10 pb-4 px-6 relative">
                    <div className="relative mb-4">
                        <Avatar className="size-24 md:size-32">
                            <AvatarImage src={coordinator.avatar} />
                            <AvatarFallback className="text-3xl bg-muted">{coordinator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {coordinator.status === 'ACTIVE' && (
                            <div className="absolute bottom-1.5 right-1.5 size-6 bg-[#34D399] rounded-full border-4 border-white" />
                        )}
                    </div>
                    <h2 className="text-2xl font-medium text-foreground">{coordinator.name}</h2>
                    <span className="text-sm text-muted-foreground mb-3">{coordinator.email}</span>
                    <Badge variant={coordinator.status === 'ACTIVE' ? 'success' : coordinator.status === 'UNASSIGNED' ? 'warning' : 'secondary'} className={`uppercase px-4 py-1 tracking-wider text-xs font-medium ${coordinator.status === 'ACTIVE' ? 'bg-[#99F6E4]/50 text-[#16A34A] hover:bg-[#99F6E4]/50' : ''}`}>
                        {coordinator.status}
                    </Badge>
                </div>

                <div className="px-6 pb-6 w-full flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground font-medium">Assignment Details</p>
                    <div className="bg-[#F3F4F6] rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="size-[18px]" />
                                <span>Assigned Area</span>
                            </div>
                            <span className="font-medium text-foreground">{coordinator.assignedArea}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="size-[18px]" />
                                <span>Managed Hubs</span>
                            </div>
                            <span className="font-medium text-[#16A34A]">{coordinator.activeHubs} Active</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Activity className="size-[18px]" />
                                <span>Last Active</span>
                            </div>
                            <span className="font-medium text-foreground">10 mins ago</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-8 mt-12 md:mt-24 flex gap-3">
                    <Button variant="secondary" className='flex-1'>
                        Suspend Coordinator
                    </Button>
                    <Button variant="default" className='flex-1'>
                        Reassign Area
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function CreateHubDialog({ children, mode = 'create', hub }: { children?: React.ReactNode, mode?: 'create' | 'edit', hub?: HubRow }) {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="default">
                        <Plus className="size-4 mr-2" />
                        Create Hub
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-6 md:p-8 rounded-2xl border-none shadow-xl gap-6">
                <div className="flex flex-col items-center mb-2">
                    <h2 className="text-2xl md:text-3xl font-semibold text-center text-foreground">{mode === 'edit' ? 'Edit Hub' : 'Create New Hub'}</h2>
                </div>
                
                <div className="flex flex-col gap-5 w-full">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">Hub Name</label>
                        <Input 
                            defaultValue={hub?.name || ''}
                            placeholder="e.g. Kingston Shelter A" 
                            className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                            <Input 
                                defaultValue={hub?.location || ''}
                                placeholder="Search Address" 
                                className="h-12 rounded-lg bg-muted/50 border-none pl-10 pr-4 shadow-none"
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">Energy Source</label>
                        <Select>
                            <SelectTrigger className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none">
                                <SelectValue placeholder="Bluetti" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-md">
                                <SelectItem value="bluetti">Bluetti</SelectItem>
                                <SelectItem value="solar">Solar Panel</SelectItem>
                                <SelectItem value="grid">Grid Power</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">Community</label>
                            <Select>
                                <SelectTrigger className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none">
                                    <SelectValue placeholder="Zone 3" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-md">
                                    <SelectItem value="zone1">Zone 1</SelectItem>
                                    <SelectItem value="zone2">Zone 2</SelectItem>
                                    <SelectItem value="zone3">Zone 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">Connectivity</label>
                            <Select>
                                <SelectTrigger className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none">
                                    <SelectValue placeholder="Starlink" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-md">
                                    <SelectItem value="starlink">Starlink</SelectItem>
                                    <SelectItem value="cellular">Cellular</SelectItem>
                                    <SelectItem value="wifi">WiFi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full items-center justify-end">
                    <Button onClick={() => setOpen(false)} variant="outline">
                        Cancel
                    </Button>
                    <Button onClick={() => setOpen(false)} variant="default">
                        {mode === 'edit' ? 'Save Changes' : 'Create Hub'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function AssignCoordinatorDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<'select' | 'success'>('select')

    const handleOpenChange = (val: boolean) => {
        setOpen(val)
        if (!val) {
            setTimeout(() => setStep('select'), 300)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="default">
                        <Plus className="size-4 mr-2" />
                        Assign Coordinator
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className={cn("border-none shadow-xl flex flex-col p-6 md:p-8 rounded-2xl gap-6 transition-all duration-300", step === 'select' ? "sm:max-w-xl" : "sm:max-w-md items-center text-center")}>
                {step === 'select' ? (
                    <>
                        <div className="flex flex-col items-start mb-2 w-full">
                            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Assign Coordinator</h2>
                        </div>
                        
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm font-medium text-foreground">Select Coordinator</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search Coordinators" 
                                    className="h-12 rounded-lg bg-muted/50 border-none pl-10 pr-4 shadow-none"
                                />
                            </div>
                        </div>

                        <div className="w-full bg-muted/30 rounded-xl p-4 flex flex-col gap-2">
                            {[
                                { name: 'Omar Symister', location: 'Zone 3 - Oceanview' },
                                { name: 'Grace Reid', location: 'Savanna-la-Mar' },
                                { name: 'Juline Asquith', location: 'Zone 3 - Oceanview' }
                            ].map((person, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                                    <Avatar className="size-12 bg-muted flex items-center justify-center border-none">
                                        <AvatarFallback className="text-muted-foreground font-medium">{person.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-base font-medium text-foreground">{person.name}</span>
                                        <span className="text-sm text-muted-foreground">{person.location}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full">
                            <Button onClick={() => handleOpenChange(false)} variant="secondary" className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={() => setStep('success')} className="flex-1">
                                Confirm Assignment
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col items-center gap-6 mt-4 w-full">
                            <BadgeCheck className="size-24 text-primary" strokeWidth={1.5} />
                            <div className="flex flex-col gap-3 items-center">
                                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                                    Successfully Assigned!
                                </h2>
                                <p className="text-base text-muted-foreground max-w-sm">
                                    Grace Reid has been successfully assigned to coordinate the following hub:
                                </p>
                            </div>
                        </div>

                        <div className="bg-muted/30 rounded-xl p-6 w-full flex flex-col gap-5 text-left mt-2">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hub Name</span>
                                <span className="text-base font-medium text-foreground">Little London Primary</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</span>
                                <span className="text-base font-medium text-foreground">Riverside Park</span>
                            </div>
                        </div>

                        <div className="w-full mt-4">
                            <Button onClick={() => handleOpenChange(false)} className="w-full h-12 rounded-lg font-medium shadow-sm">
                                Close
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

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

    const columns: DataTableColumn<ResidentRow>[] = useMemo(
        () => [
            {
                key: 'user',
                header: 'RESIDENTS',
                className: 'font-medium py-2 px-2 text-sm',
                render: (resident: ResidentRow) => <ResidentProfile {...resident} />,
            },
            {
                key: 'community',
                header: 'COMMUNITY',
                className: 'py-2 text-muted-foreground text-left pr-4',
                headerClassName: 'text-left pr-4',
                render: (resident: ResidentRow) => resident.community,
            },
            {
                key: 'lastCheckIn',
                header: 'LAST CHECK IN',
                className: 'py-2 text-left pr-4',
                headerClassName: 'text-left pr-4',
                render: (resident: ResidentRow) => resident.lastCheckIn,
            },
            {
                key: 'status',
                header: 'STATUS',
                className: 'py-2 text-left pr-4',
                headerClassName: 'text-left pr-4',
                render: (resident: ResidentRow) => (
                    <Badge variant={statusVariant(resident.status)} className="rounded-full px-3 py-1 text-xs font-semibold">
                        {resident.status}
                    </Badge>
                ),
            },
            {
                key: 'action',
                header: 'ACTION',
                className: 'py-2 text-left pr-4',
                headerClassName: 'text-left pr-4',
                render: (resident: ResidentRow) => <ResidentActionCell resident={resident} />,
            },
        ],
        [],
    )

    const hubColumns: DataTableColumn<HubRow>[] = useMemo(
        () => [
            {
                key: 'hub',
                header: 'HUB DETAILS',
                className: 'font-medium py-2 px-2 text-sm',
                render: (hub: HubRow) => hub.name,
            },
            {
                key: 'location',
                header: 'LOCATION',
                className: 'py-2 text-center',
                headerClassName: 'text-center',
                render: (hub: HubRow) => (
                    <div className="whitespace-normal max-w-[120px] mx-auto leading-tight">{hub.location}</div>
                ),
            },
            {
                key: 'lastSync',
                header: 'LAST SYNC',
                className: 'py-2 text-center',
                headerClassName: 'text-center',
                render: (hub: HubRow) => hub.lastSync,
            },
            {
                key: 'status',
                header: 'STATUS',
                className: 'py-2 text-center',
                headerClassName: 'text-center',
                render: (hub: HubRow) => (
                    <Badge variant={hub.status === 'ONLINE' ? 'success' : 'destructive'} className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                        {hub.status}
                    </Badge>
                ),
            },
            {
                key: 'action',
                header: 'ACTION',
                className: 'py-2 text-left pr-4',
                headerClassName: 'text-left pr-4',
                render: (hub: HubRow) => <HubActionCell hub={hub} />,
            },
        ],
        [],
    )

    const coordinatorColumns: DataTableColumn<CoordinatorRow>[] = useMemo(
        () => [
            {
                key: 'user',
                header: 'COORDINATOR',
                className: 'font-medium py-2 px-2 text-sm',
                render: (coordinator: CoordinatorRow) => <ResidentProfile name={coordinator.name} email={coordinator.email} avatar={coordinator.avatar} />,
            },
            {
                key: 'assignedArea',
                header: 'ASSIGNED AREA',
                className: 'py-2 text-center text-muted-foreground',
                headerClassName: 'text-center',
                render: (coordinator: CoordinatorRow) => coordinator.assignedArea,
            },
            {
                key: 'activeHubs',
                header: 'ACTIVE HUBS',
                className: 'py-2 text-center text-muted-foreground',
                headerClassName: 'text-center',
                render: (coordinator: CoordinatorRow) => coordinator.activeHubs,
            },
            {
                key: 'status',
                header: 'STATUS',
                className: 'py-2 text-center',
                headerClassName: 'text-center',
                render: (coordinator: CoordinatorRow) => (
                    <Badge variant={coordinator.status === 'ACTIVE' ? 'success' : coordinator.status === 'UNASSIGNED' ? 'warning' : 'secondary'} className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                        {coordinator.status}
                    </Badge>
                ),
            },
            {
                key: 'action',
                header: 'ACTION',
                className: 'py-2 text-right pr-4',
                headerClassName: 'text-right pr-4',
                render: (coordinator: CoordinatorRow) => <CoordinatorActionCell coordinator={coordinator} />,
            },
        ],
        [],
    )

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
                                                <DataTable columns={columns} data={residents} noun="residents" emptyIcon={<Eye className="h-6 w-6" />} />
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
