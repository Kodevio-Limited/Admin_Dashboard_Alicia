import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Route as RouteIcon, Clock, MapPin, X } from 'lucide-react'
import type { RouteInfo } from '@/hooks/useMapNavigation'

interface MapNavigationPanelProps {
    isNavigating: boolean
    showControls: boolean
    routeInfo: RouteInfo | null
    onEndNavigation: () => void
}

export function MapNavigationPanel({
    isNavigating,
    showControls,
    routeInfo,
    onEndNavigation,
}: MapNavigationPanelProps) {
    if (!isNavigating || !showControls) return null

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <Card className="bg-white/95 backdrop-blur-md border-none shadow-xl rounded-2xl">
                <CardContent className="px-5 py-4 flex items-center gap-5">
                    {!routeInfo ? (
                        <>
                            <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            <span className="text-sm font-medium text-slate-700">Calculating route…</span>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-1.5 text-primary">
                                <RouteIcon className="size-4" />
                                <span className="font-bold text-sm">{routeInfo.distanceKm} km</span>
                            </div>
                            <div className="w-px h-5 bg-slate-200" />
                            <div className="flex items-center gap-1.5 text-slate-600">
                                <Clock className="size-4" />
                                <span className="font-medium text-sm">~{routeInfo.durationMin} min</span>
                            </div>
                            <div className="w-px h-5 bg-slate-200" />
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <MapPin className="size-4" />
                                <span className="text-xs">Driving</span>
                            </div>
                        </>
                    )}
                    <Button
                        variant="destructive"
                        size="sm"
                        className="ml-2 flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border-none shadow-none rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors"
                        onClick={onEndNavigation}
                    >
                        <X className="size-3.5" />
                        End
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
