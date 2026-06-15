import { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
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
import { updateResident } from '@/lib/management'
import type { ResidentRow, ResidentStatus } from '@/lib/management'
import { EditResidentDialog } from './EditResidentDialog'

function statusVariant(status: ResidentStatus): 'success' | 'warning' | 'destructive' {
    if (status === 'ACTIVE') return 'success'
    if (status === 'DELAYED') return 'warning'
    return 'destructive'
}

export function ResidentActionCell({ resident }: { resident: ResidentRow }) {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const createStatusMutation = (status: ResidentStatus) =>
        useMutation({
            mutationFn: (id: number) => {
                const updated = updateResident(id, { status })
                if (!updated) throw new Error('Resident not found')
                return Promise.resolve(updated)
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['management-residents'] })
                setOpen(false)
                toast.success(`Resident status updated to ${status}`)
            },
        })

    const delayMutation = createStatusMutation('DELAYED')
    const suspendMutation = createStatusMutation('SILENT')
    const unsuspendMutation = createStatusMutation('ACTIVE')

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
                    {resident.status === 'SILENT' ? (
                        <DropdownMenuItem
                            onSelect={() => unsuspendMutation.mutate(resident.id)}
                            disabled={unsuspendMutation.isPending}
                            className="text-green-600 focus:text-green-600"
                        >
                            Unsuspend resident
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            onSelect={() => suspendMutation.mutate(resident.id)}
                            disabled={suspendMutation.isPending}
                            className="text-destructive focus:text-destructive"
                        >
                            Suspend resident
                        </DropdownMenuItem>
                    )}
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
                    <Badge
                        variant={statusVariant(resident.status)}
                        className={`uppercase px-4 py-1 tracking-wider text-xs font-medium ${resident.status === 'ACTIVE' ? 'bg-[#99F6E4]/50 text-[#16A34A] hover:bg-[#99F6E4]/50' : ''}`}
                    >
                        {resident.status}
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

                <div className="px-6 pb-8 mt-12 md:mt-24 flex flex-col gap-3">
                    <Button
                        variant="secondary"
                        className="w-full"
                        disabled={delayMutation.isPending || resident.status === 'DELAYED'}
                        onClick={() => delayMutation.mutate(resident.id)}
                    >
                        <Clock className="mr-2 size-4" />
                        {delayMutation.isPending ? 'Marking...' : resident.status === 'DELAYED' ? 'Already Delayed' : 'Mark as Delayed'}
                    </Button>
                    <Button
                        variant="destructive"
                        className="w-full"
                        disabled={suspendMutation.isPending || resident.status === 'SILENT'}
                        onClick={() => suspendMutation.mutate(resident.id)}
                    >
                        <Ban className="mr-2 size-4" />
                        {suspendMutation.isPending ? 'Suspending...' : resident.status === 'SILENT' ? 'Already Suspended' : 'Suspend Account'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
