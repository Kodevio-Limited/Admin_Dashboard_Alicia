import { useState, useMemo } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useHubs } from '@/hooks/use-management'
import type { CoordinatorAPIResult } from '@/lib/api/management'

interface ReassignCoordinatorDialogProps {
    children?: React.ReactNode
    coordinator: CoordinatorAPIResult
}

export function ReassignCoordinatorDialog({ children, coordinator }: ReassignCoordinatorDialogProps) {
    const [open, setOpen] = useState(false)
    const { data: hubsData } = useHubs({ limit: 100 })
    const hubs = hubsData?.results || []

    const [selectedHubs, setSelectedHubs] = useState<number[]>([])
    const [search, setSearch] = useState('')

    const toggleHub = (id: number) => {
        setSelectedHubs((prev) => (prev.includes(id) ? prev.filter((hId) => hId !== id) : [...prev, id]))
    }

    const filteredHubs = useMemo(
        () =>
            hubs.filter(
                (h) => h.name.toLowerCase().includes(search.toLowerCase()) || h.address?.toLowerCase().includes(search.toLowerCase()),
            ),
        [hubs, search],
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md p-6 md:p-8 rounded-[32px] border-none shadow-xl gap-6 bg-white">
                <div className="flex flex-col items-center gap-6 mt-2">
                    <h2 className="text-2xl font-bold text-foreground">Reassign Coordinator</h2>
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Avatar className="size-24 md:size-28 bg-muted border-none">
                                <AvatarFallback className="text-4xl text-white font-medium bg-muted">
                                    {coordinator.full_name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            {coordinator.is_active && (
                                <div className="absolute bottom-1 right-2 size-5 bg-emerald-500 rounded-full border-2 border-white" />
                            )}
                        </div>
                        <h3 className="text-2xl font-medium text-foreground">{coordinator.full_name}</h3>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full mt-2">
                    <label className="text-sm font-semibold text-foreground">Assign to Area/Hub</label>
                    <div className="relative">
                        <Input
                            placeholder="Search hub"
                            className="h-12 rounded-xl bg-secondary border-none px-4 shadow-none pr-10 text-base placeholder:text-muted-foreground"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                    </div>

                    <div className="w-full flex flex-col gap-2 mt-2 max-h-[220px] overflow-y-auto pr-1">
                        {filteredHubs.map((hub) => {
                            const isSelected = selectedHubs.includes(hub.id)
                            return (
                                <div
                                    key={hub.id}
                                    className={cn(
                                        'flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors',
                                        isSelected ? 'bg-muted' : 'bg-secondary hover:bg-secondary/80',
                                    )}
                                    onClick={() => toggleHub(hub.id)}
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[15px] font-medium text-foreground">{hub.name}</span>
                                        <span className="text-xs text-muted-foreground">{hub.address}</span>
                                    </div>
                                    {isSelected && (
                                        <div className="flex items-center justify-center size-5 rounded-full bg-foreground">
                                            <Check className="size-3 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
                    <Button
                        onClick={() => setOpen(false)}
                        variant="secondary"
                        className="flex-1 h-12 rounded-[16px] text-base font-medium bg-secondary hover:bg-secondary/80 text-foreground"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => setOpen(false)}
                        className="flex-1 h-12 rounded-[16px] text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        Confirm Assignment
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
