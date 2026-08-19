import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useHazardDetail } from '@/hooks/useHazards'
import { useInfrastructureDetail } from '@/hooks/useInfrastructure'
import { Loader2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export function HazardDetailsDialog({
    incidentId,
    entityType,
    open,
    onOpenChange,
    markerLat,
    markerLng,
}: {
    incidentId: number | null
    entityType: 'hazard' | 'hub' | null
    open: boolean
    onOpenChange: (open: boolean) => void
    markerLat?: number
    markerLng?: number
}) {
    const navigate = useNavigate()
    const hazardQuery = useHazardDetail(entityType === 'hazard' && incidentId ? incidentId : 0)
    const hubQuery = useInfrastructureDetail(entityType === 'hub' && incidentId ? incidentId : 0)

    if (!incidentId || !entityType) return null

    if ((entityType === 'hazard' && hazardQuery.isLoading) || (entityType === 'hub' && hubQuery.isLoading)) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className="sm:max-w-md p-12 flex items-center justify-center border-none shadow-2xl rounded-2xl"
                    aria-describedby={undefined}
                >
                    <DialogTitle className="sr-only">Loading details</DialogTitle>
                    <Loader2 className="size-8 animate-spin text-primary" />
                </DialogContent>
            </Dialog>
        )
    }

    let title = ''
    let subtitle = ''
    let overview = ''
    let affectedLabel = ''
    let affectedNum: number | string = ''
    let timelineItems: any[] = []
    let heroImage = ''

    if (entityType === 'hazard') {
        const hazard = hazardQuery.data
        if (!hazard) return null

        title = hazard.category ? hazard.category.charAt(0).toUpperCase() + hazard.category.slice(1) : 'Hazard'

        const diffMins = Math.floor((Date.now() - new Date(hazard.created_at).getTime()) / 60000)
        subtitle = `${diffMins < 60 ? diffMins + ' mins ago' : Math.floor(diffMins / 60) + ' hours ago'} • ${hazard.reporter_name}`
        overview = hazard.description || 'No description provided.'
        affectedLabel = 'Severity Level'
        affectedNum = `${hazard.severity}/5`

        timelineItems = [
            {
                id: hazard.id,
                author: hazard.reporter_name || 'Anonymous',
                avatarUrl: `https://ui-avatars.com/api/?name=${hazard.reporter_name?.[0] || 'A'}&background=0D8ABC&color=fff`,
                message: hazard.description,
                createdAt: hazard.created_at,
            },
        ]

        if (hazard.photo) {
            heroImage = hazard.photo
        } else {
            if (title.toLowerCase() === 'flooding')
                heroImage = 'https://images.unsplash.com/photo-1547683905-f686c993b472?q=80&w=2070&auto=format&fit=crop'
            else if (title.toLowerCase() === 'fallen tree')
                heroImage = 'https://images.unsplash.com/photo-1562624475-cb51bd20e2e9?q=80&w=2070&auto=format&fit=crop'
            else if (title.toLowerCase() === 'road block' || title.toLowerCase() === 'blocked road')
                heroImage = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=2070&auto=format&fit=crop'
            else heroImage = 'https://images.unsplash.com/photo-1502809737437-1d85c70dd2ca?q=80&w=2089&auto=format&fit=crop'
        }
    } else {
        const hub = hubQuery.data
        if (!hub) return null

        title = hub.name
        subtitle = `Status: ${hub.status.toUpperCase()}`

        const lastSync = hub.sync?.last_sync_at
            ? new Date(hub.sync.last_sync_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
            : 'Unknown'

        overview = `📍 ${hub.location?.address || 'Unknown location'}\nBattery: ${hub.battery_percentage}% • Starlink: ${hub.connectivity?.starlink ? 'Connected' : 'Offline'}`
        affectedLabel = 'Last Sync'
        affectedNum = lastSync

        timelineItems = [
            {
                id: 1,
                author: 'Hub Manager',
                avatarUrl: `https://ui-avatars.com/api/?name=HM&background=0D8ABC&color=fff`,
                message: `Internet Connectivity: ${hub.connectivity?.starlink ? 'Online ✓' : 'Offline ✗'} • Solar input: ${hub.solar?.input_w ?? 0}W, output: ${hub.solar?.output_w ?? 0}W • Battery: ${hub.battery_percentage}%`,
                createdAt: lastSync,
            },
        ]
        heroImage = 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2070&auto=format&fit=crop'
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col max-h-[90vh]"
                aria-describedby={undefined}
            >
                <div className="p-6 pb-4 relative text-center">
                    <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 mb-1">{title}</DialogTitle>
                    <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
                </div>

                <div className="px-6 pb-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
                    <div className="rounded-xl overflow-hidden mb-6 shadow-sm">
                        <img src={heroImage} alt={title} className="w-full h-48 object-cover" />
                    </div>

                    <div className="mb-8">
                        <h4 className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-wider">Situation Overview</h4>
                        <div className="bg-slate-100/80 rounded-xl p-4 text-sm text-slate-600 leading-relaxed">
                            {overview}
                            <div className="mt-2 font-medium text-slate-700">
                                {affectedLabel} <br />
                                <span className="text-lg">{affectedNum}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative pl-3 border-l-2 border-slate-200/60 ml-3 space-y-8">
                        {timelineItems.map((item: any) => (
                            <div key={item.id} className="relative flex gap-4">
                                <div className="absolute -left-[18px] top-1.5 size-2.5 bg-blue-900 rounded-full ring-4 ring-white" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <img src={item.avatarUrl} alt={item.author} className="size-6 rounded-full" />
                                            <span className="font-semibold text-sm text-slate-900">{item.author}</span>
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-400">{item.createdAt}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
                                        {item.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 pt-2 bg-white">
                    <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 text-base font-medium"
                        onClick={() => {
                            const safeLat = (v: unknown) => {
                                const n = Number(v)
                                return isFinite(n) ? n : null
                            }

                            const resolvedLat =
                                markerLat ??
                                (entityType === 'hazard' ? safeLat(hazardQuery.data?.latitude) : safeLat(hubQuery.data?.location?.latitude))
                            const resolvedLng =
                                markerLng ??
                                (entityType === 'hazard'
                                    ? safeLat(hazardQuery.data?.longitude)
                                    : safeLat(hubQuery.data?.location?.longitude))

                            if (resolvedLat === null || resolvedLng === null) {
                                import('sonner').then(({ toast }) => toast.error('No coordinates available for this location.'))
                                return
                            }

                            navigate({
                                to: '/map',
                                search: { lat: resolvedLat as number, lng: resolvedLng as number, zoom: 15, navigate: true },
                            })
                            onOpenChange(false)
                        }}
                    >
                        Navigate
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
