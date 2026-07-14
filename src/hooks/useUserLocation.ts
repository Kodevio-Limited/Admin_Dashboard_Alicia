import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

const FALLBACK_LOCATION: [number, number] = [-76.792, 18.0128]
const DISTANCE_THRESHOLD_METERS = 5

export interface UserLocationState {
    location: [number, number] | null
    accuracy: number | null
    speed: number | null
    heading: number | null
    loading: boolean
    error: Error | null
    usingFallback: boolean
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

export function useUserLocation(enabled: boolean): UserLocationState {
    const watchIdRef = useRef<number | null>(null)
    const [state, setState] = useState<UserLocationState>({
        location: null,
        accuracy: null,
        speed: null,
        heading: null,
        loading: enabled,
        error: null,
        usingFallback: false,
    })

    useEffect(() => {
        if (!enabled) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: null,
            }))
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current)
                watchIdRef.current = null
            }
            return
        }

        if (!navigator.geolocation) {
            setState({
                location: FALLBACK_LOCATION,
                accuracy: null,
                speed: null,
                heading: null,
                loading: false,
                error: new Error('Geolocation not supported'),
                usingFallback: true,
            })
            return
        }

        setState((prev) => ({ ...prev, loading: true }))

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const newLng = pos.coords.longitude
                const newLat = pos.coords.latitude

                setState((prev) => {
                    const prevLoc = prev.location
                    if (prevLoc && !prev.usingFallback) {
                        const dist = getDistance(prevLoc[1], prevLoc[0], newLat, newLng)
                        if (dist < DISTANCE_THRESHOLD_METERS) {
                            return prev
                        }
                    }

                    return {
                        location: [newLng, newLat],
                        accuracy: pos.coords.accuracy,
                        speed: pos.coords.speed,
                        heading: pos.coords.heading,
                        loading: false,
                        error: null,
                        usingFallback: false,
                    }
                })
            },
            (err) => {
                setState((prev) => {
                    if (prev.location && !prev.usingFallback) {
                        return { ...prev, error: new Error(err.message), loading: false }
                    }
                    return {
                        location: FALLBACK_LOCATION,
                        accuracy: null,
                        speed: null,
                        heading: null,
                        loading: false,
                        error: new Error(err.message),
                        usingFallback: true,
                    }
                })
            },
            { enableHighAccuracy: false, maximumAge: 10000, timeout: 10000 },
        )

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current)
                watchIdRef.current = null
            }
        }
    }, [enabled])

    return state
}

function buildMarkerElement(): HTMLElement {
    const el = document.createElement('div')
    el.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;width:56px;height:56px'

    const ring = document.createElement('div')
    ring.style.cssText = 'position:absolute;inset:0;border-radius:50%;background:rgba(37,99,235,0.12);border:2px solid rgba(37,99,235,0.3)'

    const ping = document.createElement('div')
    ping.style.cssText = 'position:absolute;inset:8px;border-radius:50%;background:rgba(59,130,246,0.35);animation:ping 1.6s cubic-bezier(0,0,0.2,1) infinite'

    const dot = document.createElement('div')
    dot.style.cssText = 'position:relative;width:24px;height:24px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 0 0 3px rgba(37,99,235,0.3), 0 4px 12px rgba(37,99,235,0.5)'

    el.appendChild(ring)
    el.appendChild(ping)
    el.appendChild(dot)
    return el
}

export function useLocationMarker(
    map: mapboxgl.Map | null,
    location: [number, number] | null,
    showLocation: boolean,
) {
    const markerRef = useRef<mapboxgl.Marker | null>(null)

    useEffect(() => {
        if (!map) return

        if (!showLocation || !location) {
            if (markerRef.current) {
                markerRef.current.remove()
            }
            return
        }

        if (!markerRef.current) {
            markerRef.current = new mapboxgl.Marker({
                element: buildMarkerElement(),
                anchor: 'center',
            })
        }

        markerRef.current.setLngLat(location)
        markerRef.current.addTo(map)

    }, [map, location, showLocation])

    useEffect(() => {
        return () => {
            if (markerRef.current) {
                markerRef.current.remove()
                markerRef.current = null
            }
        }
    }, [])
}
