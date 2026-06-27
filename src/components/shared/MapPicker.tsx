import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin } from 'lucide-react'

// Set the access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

interface MapPickerProps {
    latitude: number
    longitude: number
    onChange: (lat: number, lng: number) => void
}

export function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<mapboxgl.Map | null>(null)
    const isInteractingRef = useRef(false)

    useEffect(() => {
        if (!mapContainerRef.current) return

        // Initialize mapbox map centering around the coordinates
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [longitude || -76.792, latitude || 18.0128],
            zoom: 12,
        })

        mapRef.current = map

        // Listen for user-driven interactions
        map.on('movestart', (e) => {
            if (e.originalEvent) {
                isInteractingRef.current = true
            }
        })

        map.on('move', (e) => {
            if (e.originalEvent && isInteractingRef.current) {
                const center = map.getCenter()
                onChange(Number(center.lat.toFixed(6)), Number(center.lng.toFixed(6)))
            }
        })

        map.on('moveend', () => {
            isInteractingRef.current = false
        })

        // Cleanup map instance on unmount
        return () => {
            map.remove()
        }
    }, [])

    // Synchronize map state if coordinates change via manual input fields
    useEffect(() => {
        if (mapRef.current && !isInteractingRef.current) {
            const center = mapRef.current.getCenter()
            if (Math.abs(center.lat - latitude) > 0.0001 || Math.abs(center.lng - longitude) > 0.0001) {
                mapRef.current.jumpTo({
                    center: [longitude, latitude],
                })
            }
        }
    }, [latitude, longitude])

    return (
        <div className="relative w-full h-64 rounded-xl overflow-hidden border border-black/5 bg-slate-50">
            {/* The Mapbox container */}
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

            {/* Central Crosshair Pin Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="flex flex-col items-center -translate-y-4">
                    {/* Floating Pin */}
                    <MapPin className="size-8 text-blue-600 fill-blue-600 drop-shadow-lg" />
                    {/* Small target indicator */}
                    <div className="size-2 bg-blue-600 rounded-full ring-2 ring-white shadow-sm mt-1 animate-pulse" />
                </div>
            </div>
        </div>
    )
}
