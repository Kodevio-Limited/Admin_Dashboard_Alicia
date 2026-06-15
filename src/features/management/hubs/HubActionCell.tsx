import { useState } from 'react'
import { Eye, Clock, MapPin, Battery, Wifi, Users } from 'lucide-react'
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
import type { HubRow } from '@/lib/management'
import { CreateHubDialog } from './CreateHubDialog'
import { AssignCoordinatorDialog } from '../coordinators/AssignCoordinatorDialog'

export function HubActionCell({ hub }: { hub: HubRow }) {
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
                    <Badge
                        variant={hub.status === 'ONLINE' ? 'success' : 'destructive'}
                        className={`uppercase px-4 py-1 tracking-wider text-xs font-medium ${hub.status === 'ONLINE' ? 'bg-[#99F6E4]/50 text-[#16A34A] hover:bg-[#99F6E4]/50' : ''}`}
                    >
                        {hub.status}
                    </Badge>
                </div>

                <div className="w-full flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground font-medium">Hub Telemetry</p>
                    <div className="bg-[#F3F4F6] rounded-xl p-4 flex flex-col gap-4">
                        {[
                            { icon: <MapPin className="size-[18px]" />, label: 'Location', value: hub.location },
                            { icon: <Battery className="size-[18px]" />, label: 'Battery', value: '85%' },
                            { icon: <Wifi className="size-[18px]" />, label: 'Satellite Internet', value: 'Active' },
                            { icon: <Users className="size-[18px]" />, label: 'Linked Residents', value: '1250' },
                            { icon: <Clock className="size-[18px]" />, label: 'Last Sync', value: hub.lastSync, green: true },
                        ].map(({ icon, label, value, green }) => (
                            <div key={label} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    {icon}
                                    <span>{label}</span>
                                </div>
                                <span className={`font-medium ${green ? 'text-[#16A34A]' : 'text-foreground'}`}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-6">
                    <AssignCoordinatorDialog hub={hub}>
                        <Button className="w-full">Assign Coordinator</Button>
                    </AssignCoordinatorDialog>
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1">Restart Sync Service</Button>
                        <CreateHubDialog mode="edit" hub={hub}>
                            <Button variant="secondary" className="flex-1">Edit</Button>
                        </CreateHubDialog>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
