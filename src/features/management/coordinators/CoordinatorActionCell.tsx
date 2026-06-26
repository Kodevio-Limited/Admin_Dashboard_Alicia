import { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Eye, Clock, Users, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import type { CoordinatorAPIResult } from '@/lib/api/management'
import { ReassignCoordinatorDialog } from './ReassignCoordinatorDialog'
import { EditCoordinatorDialog } from './EditCoordinatorDialog'

export function CoordinatorActionCell({ coordinator }: { coordinator: CoordinatorAPIResult }) {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const createStatusMutation = (status: 'ACTIVE' | 'INACTIVE') =>
        useMutation({
            mutationFn: (id: string) => {
                // TODO: Actual API call for suspend/activate coordinator
                return Promise.resolve()
            },
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey: ['management'] })
            },
            onSuccess: () => {
                setOpen(false)
                toast.success(`Coordinator status updated to ${status}`)
            },
        })

    const suspendMutation = createStatusMutation('INACTIVE')
    const unsuspendMutation = createStatusMutation('ACTIVE')

    const isSuspended = !coordinator.is_active

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
                    <EditCoordinatorDialog coordinator={coordinator}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit coordinator</DropdownMenuItem>
                    </EditCoordinatorDialog>
                    <DropdownMenuSeparator />
                    <ReassignCoordinatorDialog coordinator={coordinator}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Reassign Area</DropdownMenuItem>
                    </ReassignCoordinatorDialog>
                    <DropdownMenuSeparator />
                    {isSuspended ? (
                        <DropdownMenuItem
                            onSelect={() => unsuspendMutation.mutate(coordinator.phone_number)}
                            disabled={unsuspendMutation.isPending}
                            className="text-green-600 focus:text-green-600"
                        >
                            Unsuspend coordinator
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            onSelect={() => suspendMutation.mutate(coordinator.phone_number)}
                            disabled={suspendMutation.isPending}
                            className="text-destructive focus:text-destructive"
                        >
                            Suspend coordinator
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-lg rounded-[24px]">
                <div className="flex flex-col items-center pt-10 pb-4 px-6 relative">
                    <div className="relative mb-4">
                        <Avatar className="size-24 md:size-32">
                            <AvatarFallback className="text-3xl bg-muted">{coordinator.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {coordinator.is_active && (
                            <div className="absolute bottom-1.5 right-1.5 size-6 bg-[#34D399] rounded-full border-4 border-white" />
                        )}
                    </div>
                    <h2 className="text-2xl font-medium text-foreground">{coordinator.full_name}</h2>
                    <span className="text-sm text-muted-foreground mb-3">{coordinator.email || coordinator.phone_number}</span>
                    <Badge
                        variant={coordinator.is_active ? 'success' : 'secondary'}
                        className={`uppercase px-4 py-1 tracking-wider text-xs font-medium ${coordinator.is_active ? 'bg-[#99F6E4]/50 text-[#16A34A] hover:bg-[#99F6E4]/50' : ''}`}
                    >
                        {coordinator.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                </div>

                <div className="px-6 pb-6 w-full flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground font-medium">Assignment Details</p>
                    <div className="bg-[#F3F4F6] rounded-xl p-4 flex flex-col gap-4">
                        {[
                            { icon: <Users className="size-[18px]" />, label: 'Assigned Area', value: coordinator.hub_name || 'Unassigned' },
                            { icon: <Clock className="size-[18px]" />, label: 'Phone Number', value: coordinator.phone_number, green: true },
                            { icon: <Activity className="size-[18px]" />, label: 'Last Active', value: '10 mins ago' },
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

                <div className="px-6 pb-8 mt-12 md:mt-24 flex gap-3">
                    {isSuspended ? (
                        <Button
                            variant="secondary"
                            className="flex-1"
                            disabled={unsuspendMutation.isPending}
                            onClick={() => unsuspendMutation.mutate(coordinator.phone_number)}
                        >
                            {unsuspendMutation.isPending ? 'Restoring...' : 'Unsuspend'}
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            className="flex-1"
                            disabled={suspendMutation.isPending}
                            onClick={() => suspendMutation.mutate(coordinator.phone_number)}
                        >
                            {suspendMutation.isPending ? 'Suspending...' : 'Suspend Coordinator'}
                        </Button>
                    )}
                    <ReassignCoordinatorDialog coordinator={coordinator}>
                        <Button variant="default" className="flex-1">Reassign Area</Button>
                    </ReassignCoordinatorDialog>
                </div>
            </DialogContent>
        </Dialog>
    )
}
