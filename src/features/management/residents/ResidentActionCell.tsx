import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useActivateResident, useSuspendResident } from '@/hooks/use-management'
import { Eye, Ban, Clock, MapPin } from 'lucide-react'
import { toast } from 'sonner'
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
import type { ResidentAPIResult } from '@/lib/api/management'
import { EditResidentDialog } from './EditResidentDialog'

function statusVariant(status: string): 'success' | 'warning' | 'destructive' {
    if (status === 'ACTIVE') return 'success'
    if (status === 'DELAYED') return 'warning'
    return 'destructive'
}

export function ResidentActionCell({ resident }: { resident: ResidentAPIResult }) {
    const [open, setOpen] = useState(false)
    const activateMutation = useActivateResident()
    const suspendMutation = useSuspendResident()
    const delayMutation = { isPending: false, mutate: (id: string) => {} } // TODO: Implement if needed

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
                    <EditResidentDialog resident={resident}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit resident</DropdownMenuItem>
                    </EditResidentDialog>
                    <DropdownMenuSeparator />
                    {resident.is_active ? (
                        <DropdownMenuItem
                            onSelect={() => {
                                suspendMutation.mutate(resident.phone_number)
                                setOpen(false)
                            }}
                            disabled={suspendMutation.isPending}
                            className="text-destructive focus:text-destructive"
                        >
                            Suspend resident
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            onSelect={() => {
                                activateMutation.mutate(resident.phone_number)
                                setOpen(false)
                            }}
                            disabled={activateMutation.isPending}
                            className="text-green-600 focus:text-green-600"
                        >
                            Unsuspend resident
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-lg rounded-[24px]">
                <div className="flex flex-col items-center pt-10 pb-4 px-6">
                    <div className="relative mb-4">
                        <Avatar className="size-24 md:size-32">
                            <AvatarImage src={resident.profile_photo || undefined} />
                            <AvatarFallback className="text-3xl bg-muted">{resident.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {resident.is_active && (
                            <div className="absolute bottom-1.5 right-1.5 size-6 bg-emerald-500 rounded-full border-4 border-white" />
                        )}
                    </div>
                    <h2 className="text-2xl font-medium mb-3 text-foreground">{resident.full_name}</h2>
                    <Badge
                        variant={statusVariant(resident.is_active ? 'ACTIVE' : 'INACTIVE')}
                        className="uppercase px-4 py-1 tracking-wider text-xs font-medium"
                    >
                        {resident.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                </div>

                <div className="px-6 pb-6 w-full flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground font-medium">Location &amp; Status</p>
                    <div className="bg-muted rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="size-[18px]" />
                                <span>Community</span>
                            </div>
                            <span className="font-medium text-foreground">{resident.community || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="size-[18px]" />
                                <span>Last Check In</span>
                            </div>
                            <span className="font-medium text-emerald-600">
                                {resident.last_checkin
                                    ? new Date(resident.last_checkin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : 'Never'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-8 mt-12 md:mt-24 flex flex-col gap-3">
                    <Button
                        variant="secondary"
                        className="w-full"
                        disabled={delayMutation.isPending || !resident.is_active}
                        onClick={() => {
                            delayMutation.mutate(resident.phone_number)
                            setOpen(false)
                        }}
                    >
                        <Clock className="mr-2 size-4" />
                        {delayMutation.isPending ? 'Marking...' : !resident.is_active ? 'Already Inactive' : 'Mark as Delayed'}
                    </Button>
                    {resident.is_active ? (
                        <Button
                            variant="destructive"
                            className="w-full"
                            disabled={suspendMutation.isPending}
                            onClick={() => {
                                suspendMutation.mutate(resident.phone_number)
                                setOpen(false)
                            }}
                        >
                            <Ban className="mr-2 size-4" />
                            {suspendMutation.isPending ? 'Suspending...' : 'Suspend Account'}
                        </Button>
                    ) : (
                        <Button
                            variant="default"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={activateMutation.isPending}
                            onClick={() => {
                                activateMutation.mutate(resident.phone_number)
                                setOpen(false)
                            }}
                        >
                            <Ban className="mr-2 size-4" />
                            {activateMutation.isPending ? 'Activating...' : 'Activate Account'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
