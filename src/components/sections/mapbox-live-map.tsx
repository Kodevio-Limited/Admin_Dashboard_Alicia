import { useState, useMemo, useEffect, useRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server.browser'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { type MapPoint } from '@/lib/maps'
import { useMapNavigation } from '@/hooks/useMapNavigation'
import { useUserLocation, useLocationMarker } from '@/hooks/useUserLocation'
import { useNavigate } from '@tanstack/react-router'
import { MapNavigationPanel } from './mapbox/MapNavigationPanel'
import { MapLegendPanel } from './mapbox/MapLegendPanel'
import { MapDisasterModeToggle } from './mapbox/MapDisasterModeToggle'
import { MapZoomControls } from './mapbox/MapZoomControls'
import { HazardDetailsDialog } from './hazard-details-dialog'

const MAP_STYLES = [
    { label: 'Streets', value: 'mapbox://styles/mapbox/streets-v12' },
    { label: 'Outdoors', value: 'mapbox://styles/mapbox/outdoors-v12' },
    { label: 'Light', value: 'mapbox://styles/mapbox/light-v11' },
    { label: 'Dark', value: 'mapbox://styles/mapbox/dark-v11' },
    { label: 'Satellite', value: 'mapbox://styles/mapbox/satellite-v9' },
    { label: 'Satellite Streets', value: 'mapbox://styles/mapbox/satellite-streets-v12' },
]

const DEFAULT_CENTER: [number, number] = [-76.792, 18.0128]
const DEFAULT_ZOOM = 13
const DEFAULT_STYLE = 'mapbox://styles/mapbox/streets-v12'
const FLY_TO_TOLERANCE = 0.0001

const markerHtmlCache = new Map<string, string>()

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const FILTERS = ['All', 'Medical', 'Flooding', 'Hubs', 'Fallen Tree', 'Blocked Road'] as const
export type Filter = (typeof FILTERS)[number]

export function MapPinMarker({
    color,
    icon: Icon,
    pulse = false,
    size = 'md',
}: {
    color: string
    icon?: React.ElementType
    pulse?: boolean
    size?: 'sm' | 'md' | 'lg'
}) {
    const pinSize = size === 'lg' ? 'size-12' : size === 'sm' ? 'size-6' : 'size-8'
    const iconSize = size === 'lg' ? 'size-6' : size === 'sm' ? 'size-3' : 'size-4'

    return (
        <div className="flex flex-col items-center hover:scale-110 transition-transform cursor-pointer group" style={{ color }}>
            <div className="relative">
                {pulse && (
                    <div className="absolute inset-0 rounded-full animate-ping opacity-75 scale-[1.5]" style={{ backgroundColor: color }} />
                )}
                <div className="absolute inset-0 rounded-full opacity-20 scale-[2.5]" style={{ backgroundColor: color }} />

                <div
                    className={`${pinSize} rounded-full flex items-center justify-center relative shadow-lg ring-2 ring-white`}
                    style={{ backgroundColor: color }}
                >
                    {Icon ? (
                        <Icon className={`${iconSize} text-white`} strokeWidth={2.5} />
                    ) : (
                        <div className="size-2 bg-white rounded-full" />
                    )}
                </div>

                <div
                    className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-8 border-l-transparent border-r-transparent relative -mt-1 mx-auto drop-shadow-md"
                    style={{ borderTopColor: color }}
                />
            </div>
        </div>
    )
}

export interface MapboxLiveMapProps {
    className?: string
    center?: [number, number]
    zoom?: number
    interactive?: boolean
    showControls?: boolean
    showFilters?: boolean
    showLegend?: boolean
    markers?: MapPoint[]
    onBoundsChange?: (bounds: { lat_min: number; lat_max: number; lng_min: number; lng_max: number }) => void
    autoLocate?: boolean
    navigateTarget?: [number, number]
    activeFilter?: Filter
    onActiveFilterChange?: (filter: Filter) => void
    disasterMode?: 'Pre-Disaster' | 'Post-Disaster'
    onDisasterModeChange?: (mode: 'Pre-Disaster' | 'Post-Disaster') => void
    fitAllMarkers?: boolean
    defaultShowUserLocation?: boolean
}

export function MapboxLiveMap({
    className = 'min-h-[600px] lg:min-h-[700px]',
    center,
    zoom,
    interactive = true,
    showControls = true,
    showFilters = true,
    showLegend = true,
    markers = [],
    onBoundsChange,
    autoLocate = false,
    navigateTarget,
    activeFilter: activeFilterProp,
    onActiveFilterChange,
    disasterMode: disasterModeProp,
    onDisasterModeChange,
    fitAllMarkers = false,
    defaultShowUserLocation = true,
}: MapboxLiveMapProps) {
    const navigate = useNavigate()
    const [localActiveFilter, setLocalActiveFilter] = useState<Filter>('All')
    const [localDisasterMode, setLocalDisasterMode] = useState<'Pre-Disaster' | 'Post-Disaster'>('Post-Disaster')

    const activeFilter = activeFilterProp ?? localActiveFilter
    const setActiveFilter = onActiveFilterChange ?? setLocalActiveFilter

    const disasterMode = disasterModeProp ?? localDisasterMode
    const setDisasterMode = onDisasterModeChange ?? setLocalDisasterMode

    const [mapStyle, setMapStyle] = useState(DEFAULT_STYLE)
    const [selectedIncident, setSelectedIncident] = useState<{ id: number; entityType: 'hazard' | 'hub'; lat: number; lng: number } | null>(null)
    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null)
    const [manualLocation, setManualLocation] = useState<[number, number] | null>(null)
    const [isSettingLocation, setIsSettingLocation] = useState(false)
    const [showUserLocation, setShowUserLocation] = useState(defaultShowUserLocation)

    const userLocationData = useUserLocation(showUserLocation)
    useLocationMarker(mapInstance, (manualLocation ?? userLocationData.location), showUserLocation)
    const { routeInfo, isNavigating } = useMapNavigation(mapInstance, navigateTarget, (manualLocation ?? userLocationData.location))

    const filteredHazards = useMemo(() => {
        const modeFiltered = disasterMode === 'Pre-Disaster' ? markers.filter((m) => m.entityType === 'hub') : markers
        if (activeFilter === 'All') return modeFiltered
        if (activeFilter === 'Hubs') return modeFiltered.filter((h) => h.entityType === 'hub')
        return modeFiltered.filter((h) => h.type.includes(activeFilter))
    }, [activeFilter, markers, disasterMode])

    const hazardPixelOffsets = useMemo(() => {
        const offsets = new Map<string, [number, number]>()
        const groups = new Map<string, MapPoint[]>()

        for (const m of filteredHazards) {
            const key = `${m.lat.toFixed(6)},${m.lng.toFixed(6)}`
            if (!groups.has(key)) groups.set(key, [])
            groups.get(key)!.push(m)
        }

        for (const group of groups.values()) {
            if (group.length === 1) {
                offsets.set(`${group[0].entityType}-${group[0].id}`, [0, 0])
            } else {
                const radiusPx = 22
                group.forEach((m, i) => {
                    const angle = (2 * Math.PI * i) / group.length
                    const dx = Math.round(Math.cos(angle) * radiusPx)
                    const dy = Math.round(Math.sin(angle) * radiusPx)
                    offsets.set(`${m.entityType}-${m.id}`, [dx, dy])
                })
            }
        }
        return offsets
    }, [filteredHazards])

    const mapContainerRef = useRef<HTMLDivElement | null>(null)
    const activeHtmlMarkersRef = useRef<Record<string, mapboxgl.Marker>>({})

    const clearAllHtmlMarkers = () => {
        Object.keys(activeHtmlMarkersRef.current).forEach((id) => {
            const marker = activeHtmlMarkersRef.current[id]
            if ((marker as any)._onClickCleanup) {
                (marker as any)._onClickCleanup()
            }
            marker.remove()
        })
        activeHtmlMarkersRef.current = {}
    }

    const updateViewportMarkers = () => {
        if (!mapInstance || !mapInstance.isStyleLoaded()) return

        const source = mapInstance.getSource('incidents-source')
        if (!source) return

        let features: mapboxgl.MapboxGeoJSONFeature[] = []
        try {
            features = mapInstance.queryRenderedFeatures({ layers: ['unclustered-point'] })
        } catch {
            return
        }

        const visibleMarkerIds = new Set<string>()

        features.forEach((feature) => {
            const props = feature.properties
            if (!props) return
            const id = `${props.entityType}-${props.id}`
            visibleMarkerIds.add(id)

            if (activeHtmlMarkersRef.current[id]) return

            const markerData = filteredHazards.find(
                (h) => h.id === props.id && h.entityType === props.entityType
            )
            if (!markerData) return

            const el = document.createElement('div')
            const cacheKey = `${markerData.type}-${markerData.color}-${markerData.pulse ? 'p' : 'np'}-${markerData.size}`
            if (!markerHtmlCache.has(cacheKey)) {
                markerHtmlCache.set(
                    cacheKey,
                    renderToStaticMarkup(
                        <MapPinMarker color={markerData.color} icon={markerData.icon} pulse={markerData.pulse} size={markerData.size} />
                    )
                )
            }
            el.innerHTML = markerHtmlCache.get(cacheKey)!

            const onClick = (e: MouseEvent) => {
                e.stopPropagation()
                setSelectedIncident({
                    id: markerData.id,
                    entityType: markerData.entityType,
                    lat: markerData.lat,
                    lng: markerData.lng,
                })
            }
            el.addEventListener('click', onClick)

            const offset = hazardPixelOffsets.get(`${markerData.entityType}-${markerData.id}`) || [0, 0]
            const marker = new mapboxgl.Marker({ element: el, offset })
                .setLngLat([markerData.lng, markerData.lat])
                .addTo(mapInstance)

            ;(marker as any)._onClickCleanup = () => {
                el.removeEventListener('click', onClick)
            }

            activeHtmlMarkersRef.current[id] = marker
        })

        Object.keys(activeHtmlMarkersRef.current).forEach((id) => {
            if (!visibleMarkerIds.has(id)) {
                const marker = activeHtmlMarkersRef.current[id]
                if ((marker as any)._onClickCleanup) {
                    (marker as any)._onClickCleanup()
                }
                marker.remove()
                delete activeHtmlMarkersRef.current[id]
            }
        })
    }

    useEffect(() => {
        if (!mapInstance) return

        const syncData = () => {
            const source = mapInstance.getSource('incidents-source') as mapboxgl.GeoJSONSource
            if (!source) return

            const geojson: GeoJSON.FeatureCollection = {
                type: 'FeatureCollection',
                features: filteredHazards.map((h) => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [h.lng, h.lat],
                    },
                    properties: {
                        id: h.id,
                        entityType: h.entityType,
                        type: h.type,
                    },
                })),
            }
            source.setData(geojson)
        }

        if (mapInstance.isStyleLoaded()) {
            syncData()
        } else {
            mapInstance.once('style.load', syncData)
        }
    }, [filteredHazards, mapInstance])

    useEffect(() => {
        if (!mapInstance) return

        mapInstance.on('move', updateViewportMarkers)
        mapInstance.on('zoom', updateViewportMarkers)
        mapInstance.on('sourcedata', updateViewportMarkers)

        updateViewportMarkers()

        return () => {
            mapInstance.off('move', updateViewportMarkers)
            mapInstance.off('zoom', updateViewportMarkers)
            mapInstance.off('sourcedata', updateViewportMarkers)
        }
    }, [mapInstance, filteredHazards])

    useEffect(() => {
        if (!mapContainerRef.current) return
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: mapStyle,
            center: center ?? DEFAULT_CENTER,
            zoom: zoom ?? DEFAULT_ZOOM,
            attributionControl: false,
            interactive: interactive,
        })

        map.on('load', () => {
            map.resize()
        })

        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                map.resize()
            })
            setTimeout(() => {
                if (map) map.resize()
            }, 100)
        })
        resizeObserver.observe(mapContainerRef.current)

        let boundsTimeout: NodeJS.Timeout
        map.on('moveend', () => {
            if (onBoundsChange) {
                clearTimeout(boundsTimeout)
                boundsTimeout = setTimeout(() => {
                    const bounds = map.getBounds()
                    if (bounds) {
                        onBoundsChange({
                            lat_min: bounds.getSouth(),
                            lat_max: bounds.getNorth(),
                            lng_min: bounds.getWest(),
                            lng_max: bounds.getEast(),
                        })
                    }
                }, 500)
            }
        })

        const onStyleLoad = () => {
            if (!map.getSource('incidents-source')) {
                map.addSource('incidents-source', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: []
                    },
                    cluster: true,
                    clusterMaxZoom: 14,
                    clusterRadius: 50
                })

                map.addLayer({
                    id: 'clusters',
                    type: 'circle',
                    source: 'incidents-source',
                    filter: ['has', 'point_count'],
                    paint: {
                        'circle-color': [
                            'step',
                            ['get', 'point_count'],
                            '#30A2F3', 50,
                            '#FEBD09', 200,
                            '#DC2626'
                        ],
                        'circle-radius': [
                            'step',
                            ['get', 'point_count'],
                            18, 50,
                            24, 200,
                            30
                        ],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff'
                    }
                })

                map.addLayer({
                    id: 'cluster-count',
                    type: 'symbol',
                    source: 'incidents-source',
                    filter: ['has', 'point_count'],
                    layout: {
                        'text-field': ['get', 'point_count_abbreviated'],
                        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                        'text-size': 12
                    },
                    paint: {
                        'text-color': '#ffffff'
                    }
                })

                map.addLayer({
                    id: 'unclustered-point',
                    type: 'circle',
                    source: 'incidents-source',
                    filter: ['!', ['has', 'point_count']],
                    paint: {
                        'circle-radius': 1,
                        'circle-opacity': 0
                    }
                })
            }
        }

        map.on('style.load', onStyleLoad)

        map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            })
            if (!features.length) return

            const clusterId = features[0].properties?.cluster_id
            const source = map.getSource('incidents-source') as mapboxgl.GeoJSONSource
            if (!source) return

            source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err || zoom === null || zoom === undefined) return

                map.easeTo({
                    center: (features[0].geometry as any).coordinates as [number, number],
                    zoom: zoom + 0.5,
                    essential: true
                })
            })
        })

        map.on('mouseenter', 'clusters', () => {
            map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = ''
        })

        setMapInstance(map)

        return () => {
            resizeObserver.disconnect()
            clearAllHtmlMarkers()
            map.remove()
            setMapInstance(null)
        }
    }, [interactive])

    const hasAutoLocated = useRef(false)
    useEffect(() => {
        const targetLocation = manualLocation ?? userLocationData.location
        if (!autoLocate || !mapInstance || !targetLocation) return
        if (hasAutoLocated.current) return
        hasAutoLocated.current = true
        mapInstance.flyTo({ center: targetLocation, zoom: zoom ?? 14, essential: true })
    }, [manualLocation, userLocationData.location, mapInstance, autoLocate, zoom])

    useEffect(() => {
        if (!mapInstance) return

        mapInstance.getCanvas().style.cursor = isSettingLocation ? 'crosshair' : ''

        const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
            if (isSettingLocation) {
                setManualLocation([e.lngLat.lng, e.lngLat.lat])
                setIsSettingLocation(false)
            }
        }

        if (isSettingLocation) {
            mapInstance.on('click', handleMapClick)
        }

        return () => {
            mapInstance.off('click', handleMapClick)
            if (mapInstance.getCanvas()) {
                mapInstance.getCanvas().style.cursor = ''
            }
        }
    }, [mapInstance, isSettingLocation])

    useEffect(() => {
        if (!mapInstance || !center) return

        const currentCenter = mapInstance.getCenter()
        if (Math.abs(currentCenter.lng - center[0]) > FLY_TO_TOLERANCE || Math.abs(currentCenter.lat - center[1]) > FLY_TO_TOLERANCE) {
            mapInstance.flyTo({
                center: center,
                zoom: zoom ?? DEFAULT_ZOOM,
                essential: true,
            })
        }
    }, [center?.[0], center?.[1], zoom, mapInstance])

    useEffect(() => {
        if (!mapInstance || !fitAllMarkers || markers.length === 0) return

        const bounds = new mapboxgl.LngLatBounds()
        markers.forEach((marker) => {
            bounds.extend([marker.lng, marker.lat])
        })

        if (!bounds.isEmpty()) {
            mapInstance.fitBounds(bounds, { padding: 50, duration: 1000 })
        }
    }, [mapInstance, fitAllMarkers, markers])

    return (
        <div className={`relative overflow-hidden shadow-sm ring-1 ring-black/5 bg-slate-100 ${className}`}>
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full bg-slate-100" />

            {showFilters && (
                <div className="absolute left-6 top-6 z-10 flex gap-3 overflow-x-auto max-w-[70%] pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none pointer-events-auto">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm border ${
                                activeFilter === filter
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-slate-500 border-white hover:bg-slate-50'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            )}

            <MapDisasterModeToggle
                showFilters={showFilters}
                disasterMode={disasterMode}
                onDisasterModeChange={setDisasterMode}
            />

            <MapZoomControls
                showControls={showControls}
                mapInstance={mapInstance}
                mapStyle={mapStyle}
                onMapStyleChange={setMapStyle}
                mapStyles={MAP_STYLES}
                showUserLocation={showUserLocation}
                onShowUserLocationChange={setShowUserLocation}
                userLocation={manualLocation ?? userLocationData.location}
                isSettingLocation={isSettingLocation}
                setIsSettingLocation={setIsSettingLocation}
                manualLocation={manualLocation}
                setManualLocation={setManualLocation}
            />

            <MapNavigationPanel
                isNavigating={isNavigating}
                showControls={showControls}
                routeInfo={routeInfo}
                onEndNavigation={() => {
                    if (mapInstance) {
                        if (mapInstance.getLayer('route-line')) mapInstance.removeLayer('route-line')
                        if (mapInstance.getLayer('route-glow')) mapInstance.removeLayer('route-glow')
                        if (mapInstance.getSource('route')) mapInstance.removeSource('route')
                    }
                    navigate({ to: '/map', search: (prev) => ({ ...prev, navigate: undefined }) })
                }}
            />

            <MapLegendPanel
                showLegend={showLegend}
                isNavigating={isNavigating}
            />

            <HazardDetailsDialog
                incidentId={selectedIncident?.id ?? null}
                entityType={selectedIncident?.entityType ?? null}
                markerLat={selectedIncident?.lat}
                markerLng={selectedIncident?.lng}
                open={selectedIncident !== null}
                onOpenChange={(open) => !open && setSelectedIncident(null)}
            />
        </div>
    )
}
