import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Layers, Plus, Minus, Navigation2, MapPin } from 'lucide-react'
import type { Map } from 'mapbox-gl'

interface MapZoomControlsProps {
    showControls: boolean
    mapInstance: Map | null
    mapStyle: string
    onMapStyleChange: (style: string) => void
    mapStyles: { label: string; value: string }[]
    showUserLocation: boolean
    onShowUserLocationChange: (show: boolean) => void
    userLocation: [number, number] | null
    isSettingLocation: boolean
    setIsSettingLocation: (isSetting: boolean) => void
    manualLocation: [number, number] | null
    setManualLocation: (location: [number, number] | null) => void
}

export function MapZoomControls({
    showControls,
    mapInstance,
    mapStyle,
    onMapStyleChange,
    mapStyles,
    showUserLocation,
    onShowUserLocationChange,
    userLocation,
    isSettingLocation,
    setIsSettingLocation,
    manualLocation,
    setManualLocation,
}: MapZoomControlsProps) {
    if (!showControls) return null

    return (
        <div className="absolute right-6 top-25 flex flex-col gap-3 z-10 pointer-events-auto">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="bg-white text-primary size-11 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform ring-1 ring-black/5 mb-2 outline-none cursor-pointer"
                    >
                        <Layers className="size-5" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="left" sideOffset={12} className="w-40">
                    {mapStyles.map((style) => (
                        <DropdownMenuItem
                            key={style.value}
                            onClick={() => {
                                onMapStyleChange(style.value)
                                if (mapInstance) mapInstance.setStyle(style.value)
                            }}
                            className={mapStyle === style.value ? 'bg-slate-100 font-medium' : ''}
                        >
                            {style.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex flex-col bg-white rounded-full shadow-md ring-1 ring-black/5 overflow-hidden">
                <button
                    type="button"
                    onClick={() => mapInstance?.zoomIn()}
                    className="text-primary size-11 flex items-center justify-center hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer"
                >
                    <Plus className="size-5" />
                </button>
                <button
                    type="button"
                    onClick={() => mapInstance?.zoomOut()}
                    className="text-primary size-11 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
                >
                    <Minus className="size-5" />
                </button>
            </div>

            <div className="flex flex-col bg-white rounded-full shadow-md ring-1 ring-black/5 overflow-hidden">
                <button
                    type="button"
                    className={`p-2.5 transition-colors cursor-pointer border-b border-slate-100 outline-none ${isSettingLocation || manualLocation ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'}`}
                    onClick={() => {
                        if (isSettingLocation) {
                            setIsSettingLocation(false)
                        } else {
                            setIsSettingLocation(true)
                            setManualLocation(null)
                            onShowUserLocationChange(true)
                        }
                    }}
                    title={manualLocation ? 'Using manual location' : isSettingLocation ? 'Click on map to set location' : 'Set custom location'}
                >
                    <MapPin className={`size-5 ${isSettingLocation || manualLocation ? 'fill-current' : ''}`} />
                </button>
                <button
                    type="button"
                    className={`p-2.5 transition-colors cursor-pointer border-none outline-none ${showUserLocation && !manualLocation && !isSettingLocation ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                    onClick={() => {
                        setIsSettingLocation(false)
                        setManualLocation(null)

                        if (showUserLocation) {
                            if (userLocation && mapInstance) {
                                mapInstance.flyTo({ center: userLocation, zoom: 15, essential: true })
                            } else if (mapInstance) {
                                navigator.geolocation.getCurrentPosition((pos) =>
                                    mapInstance.flyTo({
                                        center: [pos.coords.longitude, pos.coords.latitude],
                                        zoom: 15,
                                        essential: true,
                                    }),
                                )
                            }
                        } else {
                            onShowUserLocationChange(true)
                            if (userLocation && mapInstance) {
                                mapInstance.flyTo({ center: userLocation, zoom: 15, essential: true })
                            }
                        }
                    }}
                    title={showUserLocation && !manualLocation ? 'Center on my location' : 'Show my location'}
                >
                    <Navigation2 className={`size-5 ${showUserLocation && !manualLocation && !isSettingLocation ? 'fill-current' : ''}`} />
                </button>
            </div>
        </div>
    )
}
