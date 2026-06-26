import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, BadgeCheck, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { fetchCoordinators } from '@/lib/management'
import type { CoordinatorRow } from '@/lib/management'
import { useHubs } from '@/hooks/use-management'
import type { HubAPIResult } from '@/lib/api/management'

interface AssignCoordinatorDialogProps {
    children?: React.ReactNode
    hub?: HubAPIResult
}

export function AssignCoordinatorDialog({ children, hub: initialHub }: AssignCoordinatorDialogProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<'select' | 'success'>('select')

    const { data: coordinators = [] } = useQuery({ queryKey: ['management-coordinators'], queryFn: fetchCoordinators })
    const { data: hubsData } = useHubs({ limit: 100 })
    const hubs = hubsData?.results || []

    const [search, setSearch] = useState('')
    const [searchHub, setSearchHub] = useState('')
    const [selected, setSelected] = useState<CoordinatorRow | null>(null)
    const [selectedHub, setSelectedHub] = useState<HubAPIResult | null>(initialHub || null)

    useEffect(() => {
        if (initialHub) setSelectedHub(initialHub)
    }, [initialHub])

    const filteredCoordinators = useMemo(() =>
        coordinators.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            c.assignedArea.toLowerCase().includes(search.toLowerCase())
        ),
        [search, coordinators]
    )

    const filteredHubs = useMemo(() =>
        hubs.filter((h) =>
            h.name.toLowerCase().includes(searchHub.toLowerCase()) ||
            h.address.toLowerCase().includes(searchHub.toLowerCase())
        ),
        [searchHub, hubs]
    )

    const handleOpenChange = (val: boolean) => {
        setOpen(val)
        if (!val) {
            setTimeout(() => {
                setStep('select')
                setSearch('')
                setSearchHub('')
                setSelected(null)
                if (!initialHub) setSelectedHub(null)
            }, 300)
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
            <DialogContent className={cn(
                'border-none shadow-xl flex flex-col p-6 md:p-8 rounded-2xl gap-6 transition-all duration-300',
                step === 'select' ? 'sm:max-w-xl' : 'sm:max-w-md items-center text-center'
            )}>
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
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="w-full bg-muted/30 rounded-xl p-2 flex flex-col gap-1 max-h-[240px] overflow-y-auto">
                            {filteredCoordinators.length > 0 ? filteredCoordinators.map((person) => (
                                <div
                                    key={person.id}
                                    className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors ${selected?.id === person.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50 border border-transparent'}`}
                                    onClick={() => setSelected(person)}
                                >
                                    <Avatar className="size-12 bg-muted flex items-center justify-center border-none">
                                        <AvatarImage src={person.avatar} />
                                        <AvatarFallback className="text-muted-foreground font-medium">{person.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-base font-medium text-foreground">{person.name}</span>
                                        <span className="text-sm text-muted-foreground">{person.assignedArea}</span>
                                    </div>
                                    {selected?.id === person.id && (
                                        <div className="ml-auto bg-primary rounded-full size-5 flex items-center justify-center text-primary-foreground">
                                            <Check className="size-3" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">No coordinators found.</div>
                            )}
                        </div>

                        {!initialHub && (
                            <div className="flex flex-col gap-2 w-full mt-2">
                                <label className="text-sm font-medium text-foreground">Assign to Area/Hub</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Hub"
                                        className="h-12 rounded-lg bg-muted/50 border-none pl-10 pr-4 shadow-none"
                                        value={searchHub}
                                        onChange={(e) => setSearchHub(e.target.value)}
                                    />
                                </div>
                                <div className="w-full bg-muted/30 rounded-xl p-2 flex flex-col gap-1 max-h-[240px] overflow-y-auto">
                                    {filteredHubs.length > 0 ? filteredHubs.map((h) => (
                                        <div
                                            key={h.id}
                                            className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${selectedHub?.id === h.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50 border border-transparent'}`}
                                            onClick={() => setSelectedHub(h)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-base font-medium text-foreground">{h.name}</span>
                                                <span className="text-sm text-muted-foreground">{h.address}</span>
                                            </div>
                                            {selectedHub?.id === h.id && (
                                                <div className="ml-auto bg-primary rounded-full size-5 flex items-center justify-center text-primary-foreground">
                                                    <Check className="size-3" strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="p-4 text-center text-sm text-muted-foreground">No hubs found.</div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full">
                            <Button onClick={() => handleOpenChange(false)} variant="secondary" className="flex-1">Cancel</Button>
                            <Button
                                onClick={() => setStep('success')}
                                className="flex-1"
                                disabled={!selected || !selectedHub}
                            >
                                Confirm Assignment
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col items-center gap-6 mt-4 w-full">
                            <BadgeCheck className="size-24 text-primary" strokeWidth={1.5} />
                            <div className="flex flex-col gap-3 items-center">
                                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Successfully Assigned!</h2>
                                <p className="text-base text-muted-foreground max-w-sm text-center">
                                    <span className="font-medium text-foreground">{selected?.name}</span> has been successfully assigned to coordinate the following hub:
                                </p>
                            </div>
                        </div>

                        <div className="bg-muted/30 rounded-xl p-6 w-full flex flex-col gap-5 text-left mt-2">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hub Name</span>
                                <span className="text-base font-medium text-foreground">{selectedHub?.name}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</span>
                                <span className="text-base font-medium text-foreground">{selectedHub?.address}</span>
                            </div>
                        </div>

                        <div className="w-full mt-4">
                            <Button onClick={() => handleOpenChange(false)} className="w-full h-12 rounded-lg font-medium shadow-sm">Close</Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
