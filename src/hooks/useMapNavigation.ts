import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { toast } from 'sonner'

type RouteGeoJSON = {
    type: 'Feature'
    properties: Record<string, unknown>
    geometry: { type: 'LineString'; coordinates: [number, number][] }
}

export interface RouteInfo {
    distanceKm: string
    durationMin: string
}

const FALLBACK: [number, number] = [-76.792, 18.0128]
const ROUTE_LAYER_GLOW = 'route-glow'
const ROUTE_LAYER_LINE = 'route-line'
const ROUTE_SOURCE = 'route'
const DEST_MARKER_CLASS = 'destination-marker'

const FIT_BOUNDS_PADDING = 90
const FIT_BOUNDS_DURATION = 1200
const ROUTE_LINE_WIDTH = 5
const ROUTE_GLOW_WIDTH = 14
const ROUTE_GLOW_OPACITY = 0.18
const ROUTE_LINE_COLOR = '#0a065c'
const ROUTE_GLOW_COLOR = '#3b4fd8'

function clearRouteLayer(map: mapboxgl.Map) {
    if (map.getLayer(ROUTE_LAYER_LINE)) map.removeLayer(ROUTE_LAYER_LINE)
    if (map.getLayer(ROUTE_LAYER_GLOW)) map.removeLayer(ROUTE_LAYER_GLOW)
    if (map.getSource(ROUTE_SOURCE)) map.removeSource(ROUTE_SOURCE)
}

function buildDestinationMarkerEl(): HTMLElement {
    const el = document.createElement('div')
    el.className = DEST_MARKER_CLASS
    el.style.cssText = 'display:flex;flex-direction:column;align-items:center'

    const pin = document.createElement('div')
    pin.style.cssText = `
    width:32px;height:32px;border-radius:50% 50% 50% 0;
    background:${ROUTE_LINE_COLOR};transform:rotate(-45deg);
    border:3px solid white;box-shadow:0 4px 12px rgba(10,6,92,0.5);
    position:relative;
  `
    const inner = document.createElement('div')
    inner.style.cssText = 'position:absolute;inset:5px;background:white;border-radius:50%'
    pin.appendChild(inner)

    const pulse = document.createElement('div')
    pulse.style.cssText = `
    position:absolute;inset:-6px;border-radius:50% 50% 50% 0;
    background:rgba(10,6,92,0.2);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
  `
    pin.appendChild(pulse)

    el.appendChild(pin)
    return el
}

async function fetchRoute(
    userLng: number,
    userLat: number,
    targetLng: number,
    targetLat: number,
    signal: AbortSignal,
): Promise<{ routeInfo: RouteInfo; geojson: RouteGeoJSON; bounds: mapboxgl.LngLatBounds }> {
    const isValid = (v: number) => isFinite(v) && !isNaN(v)
    if (!isValid(userLng) || !isValid(userLat) || !isValid(targetLng) || !isValid(targetLat)) {
        throw new Error('Invalid coordinates — cannot draw route.')
    }

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLng},${userLat};${targetLng},${targetLat}?steps=true&geometries=geojson&overview=full&access_token=${token}`

    const res = await fetch(url, { signal })
    if (signal.aborted) throw new Error('AbortError')

    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Directions API error: ${res.status} — ${text}`)
    }

    const json = await res.json()
    if (signal.aborted) throw new Error('AbortError')

    if (!json.routes?.length) {
        throw new Error('No route found to the destination.')
    }

    const r = json.routes[0]
    const route = r.geometry.coordinates as [number, number][]
    const geojson: RouteGeoJSON = {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: route },
    }

    const bounds = route.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(route[0], route[0]))
    const distKm = (r.distance / 1000).toFixed(1)
    const durMin = Math.round(r.duration / 60).toString()

    return { routeInfo: { distanceKm: distKm, durationMin: durMin }, geojson, bounds }
}

function drawRouteOnMap(map: mapboxgl.Map, geojson: RouteGeoJSON, bounds?: mapboxgl.LngLatBounds) {
    if (!map || !map.isStyleLoaded()) return

    clearRouteLayer(map)

    const source: mapboxgl.GeoJSONSourceSpecification = {
        type: 'geojson',
        data: geojson
    }

    if (!map.getSource(ROUTE_SOURCE)) {
        map.addSource(ROUTE_SOURCE, source)
    }

    if (!map.getLayer(ROUTE_LAYER_GLOW)) {
        map.addLayer({
            id: ROUTE_LAYER_GLOW,
            type: 'line',
            source: ROUTE_SOURCE,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': ROUTE_GLOW_COLOR, 'line-width': ROUTE_GLOW_WIDTH, 'line-opacity': ROUTE_GLOW_OPACITY },
        })
    }

    if (!map.getLayer(ROUTE_LAYER_LINE)) {
        map.addLayer({
            id: ROUTE_LAYER_LINE,
            type: 'line',
            source: ROUTE_SOURCE,
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': ROUTE_LINE_COLOR, 'line-width': ROUTE_LINE_WIDTH, 'line-opacity': 1 },
        })
    }

    if (bounds) {
        map.fitBounds(bounds, { padding: FIT_BOUNDS_PADDING, maxZoom: 15, duration: FIT_BOUNDS_DURATION })
    }
}

export function useMapNavigation(
    map: mapboxgl.Map | null,
    navigateTarget: [number, number] | undefined,
    userLocation: [number, number] | null,
): { routeInfo: RouteInfo | null; isNavigating: boolean } {
    const abortRef = useRef<AbortController | null>(null)
    const destMarkerRef = useRef<mapboxgl.Marker | null>(null)
    const cachedGeoJSONRef = useRef<RouteGeoJSON | null>(null)

    const userLocationLng = userLocation?.[0]
    const userLocationLat = userLocation?.[1]

    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
    const [isNavigating, setIsNavigating] = useState(false)

    useEffect(() => {
        if (!map) return

        const handleStyleLoad = () => {
            if (cachedGeoJSONRef.current) {
                drawRouteOnMap(map, cachedGeoJSONRef.current)
            }
        }

        map.on('style.load', handleStyleLoad)

        return () => {
            map.off('style.load', handleStyleLoad)
        }
    }, [map])

    const targetLng = navigateTarget?.[0]
    const targetLat = navigateTarget?.[1]

    useEffect(() => {
        if (!map) return

        if (targetLng === undefined || targetLat === undefined) {
            abortRef.current?.abort()
            if (map.isStyleLoaded()) clearRouteLayer(map)
            destMarkerRef.current?.remove()
            destMarkerRef.current = null
            cachedGeoJSONRef.current = null
            setRouteInfo(null)
            setIsNavigating(false)
            return
        }

        abortRef.current?.abort()
        abortRef.current = new AbortController()
        const { signal } = abortRef.current

        const usingFallback = userLocationLng === undefined || userLocationLat === undefined
        const origin = usingFallback ? FALLBACK : ([userLocationLng, userLocationLat] as [number, number])

        destMarkerRef.current?.remove()
        try {
            destMarkerRef.current = new mapboxgl.Marker({
                element: buildDestinationMarkerEl(),
                anchor: 'bottom',
            })
                .setLngLat([targetLng, targetLat])
                .addTo(map)
        } catch {
            destMarkerRef.current = null
        }

        const execute = async () => {
            if (signal.aborted) return

            setIsNavigating(true)
            setRouteInfo(null)

            if (usingFallback) {
                toast.warning('Using approximate location. Enable GPS for precise routing.')
            }

            try {
                const { routeInfo: info, geojson, bounds } = await fetchRoute(
                    origin[0], origin[1], targetLng, targetLat, signal
                )

                if (signal.aborted) return

                cachedGeoJSONRef.current = geojson
                setRouteInfo(info)

                if (map.isStyleLoaded()) {
                    drawRouteOnMap(map, geojson, bounds)
                }
            } catch (err: unknown) {
                if (err instanceof Error && (err.name === 'AbortError' || err.message === 'AbortError')) return
                console.error('Route fetch failed', err)
                toast.error(err instanceof Error ? err.message : 'Failed to calculate route.')
            }
        }

        execute()

        return () => {
            abortRef.current?.abort()
        }
    }, [map, targetLng, targetLat, userLocationLng, userLocationLat])

    useEffect(() => {
        return () => {
            abortRef.current?.abort()
            destMarkerRef.current?.remove()
        }
    }, [])

    return { routeInfo, isNavigating }
}
