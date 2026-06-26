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

    // TODO: Implement actual delay API when available
    const delayMutation = useMutation({
        mutationFn: (id: string) => Promise.resolve(),
        onSuccess: () => {
            setOpen(false)
            toast.success(`Resident status updated to DELAYED`)
        },
    })

    const { mutate: suspend, isPending: isSuspending } = useSuspendResident()
    const { mutate: activate, isPending: isActivating } = useActivateResident()

    const handleSuspend = (id: string) => {
        suspend(id, {
            onSuccess: () => {
                setOpen(false)
                toast.success('Resident account suspended')
            },
            onError: (err) => {
                toast.error(`Failed to suspend account: ${err.message}`)
            }
        })
    }

    const handleActivate = (id: string) => {
        activate(id, {
            onSuccess: () => {
                setOpen(false)
                toast.success('Resident account activated')
            },
            onError: (err) => {
                toast.error(`Failed to activate account: ${err.message}`)
            }
        })
    }

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
                            onSelect={() => handleSuspend(resident.phone_number)}
                            disabled={isSuspending}
                            className="text-destructive focus:text-destructive"
                        >
                            Suspend resident
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            onSelect={() => handleActivate(resident.phone_number)}
                            disabled={isActivating}
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
                            <div className="absolute bottom-1.5 right-1.5 size-6 bg-[#34D399] rounded-full border-4 border-white" />
                        )}
                    </div>
                    <h2 className="text-2xl font-medium mb-3 text-foreground">{resident.full_name}</h2>
                    <Badge
                        variant={statusVariant(resident.is_active ? 'ACTIVE' : 'INACTIVE')}
                        className={`uppercase px-4 py-1 tracking-wider text-xs font-medium ${resident.is_active ? 'bg-[#99F6E4]/50 text-[#16A34A] hover:bg-[#99F6E4]/50' : ''}`}
                    >
                        {resident.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                </div>

                <div className="px-6 pb-6 w-full flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground font-medium">Location &amp; Status</p>
                    <div className="bg-[#F3F4F6] rounded-xl p-4 flex flex-col gap-4">
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
                            <span className="font-medium text-[#16A34A]">{resident.last_checkin ? new Date(resident.last_checkin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-8 mt-12 md:mt-24 flex flex-col gap-3">
                    <Button
                        variant="secondary"
                        className="w-full"
                        disabled={delayMutation.isPending || !resident.is_active}
                        onClick={() => delayMutation.mutate(resident.phone_number)}
                    >
                        <Clock className="mr-2 size-4" />
                        {delayMutation.isPending ? 'Marking...' : !resident.is_active ? 'Already Inactive' : 'Mark as Delayed'}
                    </Button>
                    {resident.is_active ? (
                        <Button
                            variant="destructive"
                            className="w-full"
                            disabled={isSuspending}
                            onClick={() => handleSuspend(resident.phone_number)}
                        >
                            <Ban className="mr-2 size-4" />
                            {isSuspending ? 'Suspending...' : 'Suspend Account'}
                        </Button>
                    ) : (
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            disabled={isActivating}
                            onClick={() => handleActivate(resident.phone_number)}
                        >
                            {isActivating ? 'Activating...' : 'Activate Account'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
