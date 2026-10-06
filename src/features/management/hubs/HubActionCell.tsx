import { useState } from 'react'
import { Eye, Clock, MapPin, Battery, Wifi, Users, Trash2, Power, PowerOff, AlertTriangle } from 'lucide-react'
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { HubAPIResult } from '@/lib/api/management'
import { useDeleteHub, useUpdateHubStatus } from '@/hooks/use-management'
import { AssignCoordinatorDialog } from '../coordinators/AssignCoordinatorDialog'

export function HubActionCell({ hub }: { hub: HubAPIResult }) {
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateHubStatus()
    const { mutate: deleteHub, isPending: isDeleting } = useDeleteHub()

    const isOpen = hub.status === 'open'

    const handleToggleStatus = () => {
        const nextStatus = isOpen ? 'closed' : 'open'
        updateStatus({ hubId: hub.id, status: nextStatus })
    }

    const handleDelete = () => {
        deleteHub(hub.id, {
            onSuccess: () => {
                setDeleteOpen(false)
                setDetailsOpen(false)
            },
        })
    }

    return (
        <>
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 font-medium">
                            <Eye className="size-3.5" />
                            Action
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={8} className="w-48">
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                <Eye className="size-4 mr-2" />
                                View details
                            </DropdownMenuItem>
                        </DialogTrigger>

                        <DropdownMenuItem
                            onClick={handleToggleStatus}
                            disabled={isUpdatingStatus}
                            className="cursor-pointer"
                        >
                            {isOpen ? (
                                <>
                                    <PowerOff className="size-4 mr-2 text-amber-600" />
                                    <span>Close Hub</span>
                                </>
                            ) : (
                                <>
                                    <Power className="size-4 mr-2 text-emerald-600" />
                                    <span>Open Hub</span>
                                </>
                            )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onSelect={() => setDeleteOpen(true)}
                            className="text-destructive focus:text-destructive cursor-pointer"
                        >
                            <Trash2 className="size-4 mr-2" />
                            Delete hub
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DialogContent className="sm:max-w-md p-6 md:p-8 overflow-hidden border-none shadow-lg rounded-[24px]">
                    <div className="flex flex-col items-center pt-2 pb-6 px-2">
                        <h2 className="text-2xl font-bold mb-3 text-foreground text-center">{hub.name}</h2>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={
                                    hub.status === 'open'
                                        ? 'success'
                                        : hub.status === 'low_battery' || hub.status === 'critical'
                                          ? 'destructive'
                                          : 'warning'
                                }
                                className="uppercase px-4 py-1 tracking-wider text-xs font-semibold"
                            >
                                {hub.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-3">
                        <p className="text-sm text-muted-foreground font-medium">Hub Telemetry</p>
                        <div className="bg-muted rounded-xl p-4 flex flex-col gap-4">
                            {[
                                { icon: <MapPin className="size-[18px]" />, label: 'Location', value: hub.address },
                                { icon: <Battery className="size-[18px]" />, label: 'Battery', value: `${hub.battery_percentage}%` },
                                {
                                    icon: <Wifi className="size-[18px]" />,
                                    label: 'Satellite Internet',
                                    value: hub.starlink_status ? 'Active' : 'Offline',
                                },
                                { icon: <Users className="size-[18px]" />, label: 'Linked Residents', value: hub.residents_count },
                                {
                                    icon: <Clock className="size-[18px]" />,
                                    label: 'Coordinator',
                                    value: hub.coordinator_name || 'Unassigned',
                                    green: true,
                                },
                            ].map(({ icon, label, value, green }) => (
                                <div key={label} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        {icon}
                                        <span>{label}</span>
                                    </div>
                                    <span className={`font-medium ${green ? 'text-emerald-600' : 'text-foreground'}`}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-6">
                        <AssignCoordinatorDialog hub={hub}>
                            <Button className="w-full">
                                {hub.coordinator_name &&
                                hub.coordinator_name.trim() !== '' &&
                                hub.coordinator_name.toLowerCase() !== 'unassigned' &&
                                hub.coordinator_name.toLowerCase() !== 'none'
                                    ? 'Reassign Coordinator'
                                    : 'Assign Coordinator'}
                            </Button>
                        </AssignCoordinatorDialog>

                        <div className="flex gap-2.5">
                            <Button
                                variant={isOpen ? 'outline' : 'default'}
                                className={`flex-1 gap-2 ${!isOpen ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                                onClick={handleToggleStatus}
                                disabled={isUpdatingStatus}
                            >
                                {isOpen ? (
                                    <>
                                        <PowerOff className="size-4 text-amber-600" />
                                        Close Hub
                                    </>
                                ) : (
                                    <>
                                        <Power className="size-4" />
                                        Open Hub
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="destructive"
                                className="flex-1 gap-2"
                                onClick={() => setDeleteOpen(true)}
                            >
                                <Trash2 className="size-4" />
                                Delete Hub
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="sm:max-w-md rounded-2xl">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2 text-destructive mb-1">
                            <AlertTriangle className="size-5" />
                            <AlertDialogTitle>Delete Hub?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-left">
                            Are you sure you want to delete <span className="font-semibold text-foreground">{hub.name}</span>?
                            This will permanently remove the hub and unassign all associated records. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Hub'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
