import { useState, useEffect } from 'react'
import { Plus, MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { HubAPIResult } from '@/lib/api/management'
import { useCreateHub, useCoordinators } from '@/hooks/use-management'
import { MapPicker } from '@/components/shared/MapPicker'
import { toast } from 'sonner'

interface CreateHubDialogProps {
    children?: React.ReactNode
    mode?: 'create' | 'edit'
    hub?: HubAPIResult
}

export function CreateHubDialog({ children, mode = 'create', hub }: CreateHubDialogProps) {
    const [open, setOpen] = useState(false)

    const [name, setName] = useState(hub?.name || '')
    const [address, setAddress] = useState(hub?.address || '')
    const [latitude, setLatitude] = useState<number>(18.0128)
    const [longitude, setLongitude] = useState<number>(-76.792)
    const [maxBookings, setMaxBookings] = useState<number>(10)
    const [coordinatorId, setCoordinatorId] = useState<string>('none')
    const [coordinatorSearch, setCoordinatorSearch] = useState('')
    const [showCoordinatorDropdown, setShowCoordinatorDropdown] = useState(false)
    const [suggestions, setSuggestions] = useState<any[]>([])

    const createHubMutation = useCreateHub()
    const { data: coordinatorsData } = useCoordinators({ limit: 100 })

    // Synchronize coordinator search values if the list loads or edits are made
    useEffect(() => {
        if (open && hub?.coordinator_name && coordinatorsData?.results) {
            const coord = coordinatorsData.results.find((c) => c.full_name === hub.coordinator_name)
            if (coord) {
                setCoordinatorId(coord.phone_number)
                setCoordinatorSearch(`${coord.full_name} (${coord.phone_number})`)
            }
        }
    }, [coordinatorsData, open, hub])

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen) {
            setName(hub?.name || '')
            setAddress(hub?.address || '')
            setLatitude(18.0128)
            setLongitude(-76.792)
            setMaxBookings(10)
            setSuggestions([])

            if (hub?.coordinator_name && coordinatorsData?.results) {
                const coord = coordinatorsData.results.find((c) => c.full_name === hub.coordinator_name)
                if (coord) {
                    setCoordinatorId(coord.phone_number)
                    setCoordinatorSearch(`${coord.full_name} (${coord.phone_number})`)
                } else {
                    setCoordinatorId('none')
                    setCoordinatorSearch(hub.coordinator_name)
                }
            } else {
                setCoordinatorId('none')
                setCoordinatorSearch('')
            }
            setShowCoordinatorDropdown(false)
        }
    }

    const fetchSuggestions = async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([])
            return
        }
        try {
            const token =
                import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
                'pk.eyJ1Ijoic3RlbXNwYXJrc29sdXRpb25zIiwiYSI6ImNtcWQwOGE0bjB5YXkycHIxY2xibG9tODIifQ.oAyTzV6aPMxZltPdFAE3fA'
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=5`,
            )
            const data = await res.json()
            setSuggestions(data.features || [])
        } catch (e) {
            console.error('Geocoding suggestions error:', e)
        }
    }

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error('Hub name is required')
            return
        }
        if (!address.trim()) {
            toast.error('Address is required')
            return
        }

        createHubMutation.mutate(
            {
                name,
                address,
                latitude,
                longitude,
                max_concurrent_bookings: maxBookings,
                coordinator_id: coordinatorId !== 'none' ? coordinatorId : undefined,
            },
            {
                onSuccess: () => {
                    toast.success('Hub created successfully!')
                    setOpen(false)
                },
                onError: (err: any) => {
                    toast.error(err?.message || 'Failed to create hub.')
                },
            },
        )
    }

    // Filter list of coordinators dynamically as the user types
    const filteredCoordinators = (coordinatorsData?.results || []).filter(
        (c) => c.full_name.toLowerCase().includes(coordinatorSearch.toLowerCase()) || c.phone_number.includes(coordinatorSearch),
    )

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="default">
                        <Plus className="size-4 mr-2" />
                        Create Hub
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-6 md:p-8 rounded-2xl border-none shadow-xl gap-6 overflow-y-auto max-h-[90vh]">
                <div className="flex flex-col items-center mb-2">
                    <h2 className="text-2xl md:text-3xl font-semibold text-center text-foreground">
                        {mode === 'edit' ? 'Edit Hub' : 'Create New Hub'}
                    </h2>
                </div>

                <div className="flex flex-col gap-5 w-full">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">Hub Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Kingston Shelter A"
                            className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2 relative">
                        <label className="text-sm font-medium text-foreground">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                            <Input
                                value={address}
                                onChange={(e) => {
                                    setAddress(e.target.value)
                                    fetchSuggestions(e.target.value)
                                }}
                                placeholder="Search Address"
                                className="h-12 rounded-lg bg-muted/50 border-none pl-10 pr-4 shadow-none"
                            />
                        </div>
                        {suggestions.length > 0 && (
                            <ul className="absolute top-[76px] left-0 right-0 bg-white border border-black/5 rounded-xl shadow-xl z-50 py-1 overflow-hidden max-h-48 overflow-y-auto">
                                {suggestions.map((item) => (
                                    <li
                                        key={item.id}
                                        onClick={() => {
                                            setAddress(item.place_name)
                                            if (item.geometry && item.geometry.coordinates) {
                                                const [lng, lat] = item.geometry.coordinates
                                                setLatitude(Number(lat.toFixed(6)))
                                                setLongitude(Number(lng.toFixed(6)))
                                            }
                                            setSuggestions([])
                                        }}
                                        className="px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-slate-50 cursor-pointer transition-colors border-b border-black/5 last:border-none"
                                    >
                                        {item.place_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">Latitude</label>
                            <Input
                                type="number"
                                step="any"
                                value={latitude}
                                onChange={(e) => setLatitude(Number(e.target.value))}
                                className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">Longitude</label>
                            <Input
                                type="number"
                                step="any"
                                value={longitude}
                                onChange={(e) => setLongitude(Number(e.target.value))}
                                className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-muted-foreground">Select Coordinates on Map</label>
                        <MapPicker
                            latitude={latitude}
                            longitude={longitude}
                            onChange={(lat, lng) => {
                                setLatitude(lat)
                                setLongitude(lng)
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground">Max Concurrent Bookings</label>
                        <Input
                            type="number"
                            value={maxBookings}
                            onChange={(e) => setMaxBookings(Number(e.target.value))}
                            className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2 relative">
                        <label className="text-sm font-medium text-foreground">Coordinator</label>
                        <div className="relative">
                            <Input
                                value={coordinatorSearch}
                                onFocus={() => setShowCoordinatorDropdown(true)}
                                onChange={(e) => {
                                    setCoordinatorSearch(e.target.value)
                                    setShowCoordinatorDropdown(true)
                                }}
                                placeholder="Search & Assign Coordinator (Name or Phone)"
                                className="h-12 rounded-lg bg-muted/50 border-none px-4 shadow-none pr-10"
                            />
                            {coordinatorId !== 'none' && (
                                <button
                                    onClick={() => {
                                        setCoordinatorId('none')
                                        setCoordinatorSearch('')
                                        setShowCoordinatorDropdown(false)
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>
                        {showCoordinatorDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowCoordinatorDropdown(false)} />
                                <ul className="absolute top-[76px] left-0 right-0 bg-white border border-black/5 rounded-xl shadow-xl z-50 py-1 overflow-hidden max-h-48 overflow-y-auto">
                                    <li
                                        onClick={() => {
                                            setCoordinatorId('none')
                                            setCoordinatorSearch('')
                                            setShowCoordinatorDropdown(false)
                                        }}
                                        className="px-4 py-2.5 text-xs font-semibold text-destructive hover:bg-slate-50 cursor-pointer transition-colors border-b border-black/5"
                                    >
                                        None (Unassign)
                                    </li>
                                    {filteredCoordinators.length === 0 ? (
                                        <li className="px-4 py-2.5 text-xs text-muted-foreground">No coordinators found</li>
                                    ) : (
                                        filteredCoordinators.map((coordinator) => (
                                            <li
                                                key={coordinator.phone_number}
                                                onClick={() => {
                                                    setCoordinatorId(coordinator.phone_number)
                                                    setCoordinatorSearch(`${coordinator.full_name} (${coordinator.phone_number})`)
                                                    setShowCoordinatorDropdown(false)
                                                }}
                                                className="px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-slate-50 cursor-pointer transition-colors border-b border-black/5 last:border-none"
                                            >
                                                {coordinator.full_name} ({coordinator.phone_number})
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full items-center justify-end">
                    <Button onClick={() => setOpen(false)} variant="outline">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="default" disabled={createHubMutation.isPending}>
                        {createHubMutation.isPending ? 'Creating...' : mode === 'edit' ? 'Save Changes' : 'Create Hub'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
