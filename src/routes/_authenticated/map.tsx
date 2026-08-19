import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useState, useMemo, useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { MapboxLiveMap, type Filter } from '@/components/sections/mapbox-live-map'
import { PageHeader } from '#/components/sections/page-header'
import { useDashboardMap } from '@/hooks/useDashboard'
import { useQueryErrorToast } from '@/hooks/use-query-error-toast'

const safeNum = z.preprocess((v) => {
    const n = Number(v)
    return isFinite(n) ? n : undefined
}, z.number().optional())

const mapSearchSchema = z.object({
    lat: safeNum,
    lng: safeNum,
    zoom: safeNum,
    navigate: z.boolean().optional(),
    search: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/map')({
    validateSearch: mapSearchSchema,
    component: MapPage,
})

function MapPage() {
    const search = Route.useSearch()
    const navigate = useNavigate({ from: Route.fullPath })
    const [localSearch, setLocalSearch] = useState(search.search || '')

    useEffect(() => {
        setLocalSearch(search.search || '')
    }, [search.search])

    useEffect(() => {
        const handler = setTimeout(() => {
            if (localSearch !== (search.search || '')) {
                navigate({
                    search: (prev) => ({
                        ...prev,
                        search: localSearch ? localSearch : undefined,
                    }),
                    replace: true,
                })
            }
        }, 300)
        return () => clearTimeout(handler)
    }, [localSearch, navigate, search.search])

    const center = useMemo(
        () => (search.lng && search.lat ? ([search.lng, search.lat] as [number, number]) : undefined),
        [search.lng, search.lat],
    )

    const [bounds, setBounds] = useState<{ lat_min: number; lat_max: number; lng_min: number; lng_max: number } | undefined>()
    const [activeFilter, setActiveFilter] = useState<Filter>('All')
    const [disasterMode, setDisasterMode] = useState<'Pre-Disaster' | 'Post-Disaster'>('Post-Disaster')

    const apiParams = useMemo(() => {
        let type: string | undefined = undefined
        let category: string | undefined = undefined

        if (disasterMode === 'Pre-Disaster') {
            type = 'hubs'
        } else {
            switch (activeFilter) {
                case 'Medical':
                    type = 'medical_needs'
                    break
                case 'Flooding':
                    type = 'hazards'
                    category = 'flooding'
                    break
                case 'Hubs':
                    type = 'hubs'
                    break
                case 'Fallen Tree':
                    type = 'fallen'
                    break
                case 'Road Block':
                    type = 'hazards'
                    category = 'Road Block'
                    break
                case 'All':
                default:
                    type = undefined
                    category = undefined
                    break
            }
        }
        return { type, category }
    }, [activeFilter, disasterMode])

    const { data: mapData, isError: isMapError, error: mapError, refetch: refetchMap } = useDashboardMap(bounds, apiParams.type, apiParams.category)
    const { data: allMapData, isError: isAllMapError, isFetching: isAllMapFetching } = useDashboardMap(undefined, apiParams.type, apiParams.category)

    useQueryErrorToast({ key: 'map', label: 'Map data', isError: isMapError, error: mapError })
    useQueryErrorToast({ key: 'all-map', label: 'Map search data', isError: isAllMapError })

    const querySearch = localSearch.toLowerCase().trim()
    const searchResults = useMemo(() => {
        if (!querySearch || !allMapData?.markers) return []
        const matches = allMapData.markers.filter(
            (m) =>
                (m.name || '').toLowerCase().includes(querySearch) ||
                (m.type || '').toLowerCase().includes(querySearch)
        )
        return matches.map((m) => ({
            id: `${m.entityType}-${m.id}`,
            place_name: m.name || m.type,
            center: [m.lng, m.lat] as [number, number],
            marker: m,
        }))
    }, [allMapData?.markers, querySearch])

    const handleSelectResult = (result: any) => {
        setLocalSearch(result.place_name)
        navigate({
            search: (prev) => ({
                ...prev,
                lat: result.center[1],
                lng: result.center[0],
                zoom: 15,
                navigate: undefined,
                search: result.place_name,
            }),
            replace: true,
        })
    }

    const filteredMarkers = useMemo(() => {
        const markers = mapData?.markers || []
        if (!querySearch) return markers
        return markers.filter(
            (marker) =>
                (marker.name || '').toLowerCase().includes(querySearch) ||
                marker.type.toLowerCase().includes(querySearch) ||
                marker.entityType.toLowerCase().includes(querySearch)
        )
    }, [mapData?.markers, querySearch])

    return (
        <>
            <PageHeader 
                title="Map" 
                description="Using Maps, monitor Disasters Real-time" 
                lastUpdated="05:41:15 PM" 
                searchValue={localSearch}
                onSearchChange={setLocalSearch}
                searchResults={searchResults}
                onSelectResult={handleSelectResult}
                loadingResults={isAllMapFetching && !!localSearch}
                searchPlaceholder="Search indicators, hubs, or hazards..."
            />

            {isMapError && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm mb-3">
                    <AlertCircle className="size-5 shrink-0 text-red-500" />
                    <span className="flex-1">
                        {mapError?.message
                            ? `Map data is unavailable: ${mapError.message}`
                            : 'Failed to load map data. Some features may not display.'}
                    </span>
                    <button
                        onClick={() => refetchMap()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-red-200 hover:bg-red-100 transition-colors text-red-700 text-xs font-medium"
                    >
                        <RefreshCw className="size-3.5" />
                        Retry
                    </button>
                </div>
            )}

            <div className="flex-1 w-full flex flex-col">
                <MapboxLiveMap
                    className="flex-1 w-full min-h-150 lg:min-h-175 rounded-2xl"
                    showControls={true}
                    showFilters={true}
                    showLegend={true}
                    center={center}
                    zoom={search.zoom}
                    markers={filteredMarkers}
                    onBoundsChange={setBounds}
                    autoLocate={!center}
                    navigateTarget={search.navigate && center ? center : undefined}
                    activeFilter={activeFilter}
                    onActiveFilterChange={setActiveFilter}
                    disasterMode={disasterMode}
                    onDisasterModeChange={setDisasterMode}
                />
            </div>
        </>
    )
}
