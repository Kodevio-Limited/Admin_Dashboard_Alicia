import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { adminKeys } from '@/lib/query-keys'
import { getAdminOverview } from '@/lib/api/dashboard'
import type { AdminDashboardOverviewResponse } from '@/lib/api/dashboard'
import {
    workloadData as fallbackWorkloadData,
    // urgentFlags as fallbackUrgentFlags,
    statCardsData as fallbackStatCards,
} from '@/lib/dashboard'
import type { CheckinDataPoint, HazardDataPoint, WorkloadDataPoint, UrgentFlag, StatCardData } from '@/lib/dashboard'
import { getDashboardMap } from '@/data/dashboard'
import { getMapConfig, type MapPoint } from '@/lib/maps'
import { dashboardKeys } from './keys'
import type { DashboardMapResponse } from '@/types/dashboard'

export type AdminOverviewData = AdminDashboardOverviewResponse['data'] & {
    checkinData: CheckinDataPoint[]
    hazardData: HazardDataPoint[]
    workloadData: WorkloadDataPoint[]
    urgentFlags: UrgentFlag[]
    urgentFlagsCount: number
    statCards: StatCardData[]
}

export function useAdminOverview() {
    return useQuery({
        queryKey: adminKeys.overview(),
        queryFn: getAdminOverview,
        select: (response): AdminOverviewData => {
            const data = response.data

            // Map checkins over time
            const checkinData = (data.checkins_over_time ?? []).map((pt) => ({
                time: pt.bucket.split('-')[0], // e.g. "11:19-14:19" -> "11:19"
                value: pt.count,
            }))

            // Map hazard breakdown
            const hazardData = Object.entries(data.hazard_breakdown ?? {}).map(([key, val]) => ({
                name: key.charAt(0).toUpperCase() + key.slice(1),
                value: val as number,
            }))

            // Map Stat Cards (Update what we can from the backend, keep the rest from fallback)
            const statCards = fallbackStatCards.map((card) => {
                if (card.label === 'Residents Checked-in') {
                    return { ...card, value: data.checkins?.total?.toString() || '0' }
                }
                if (card.label === 'Active Hubs') {
                    return { ...card, value: data.active_hubs?.toString() || '0' }
                }
                if (card.label === 'Coordinators Active') {
                    return { ...card, value: data.users?.coordinators?.toString() || '0' }
                }
                if (card.label === 'Open Alerts') {
                    return { ...card, value: data.hazard_reports?.toString() || '0' }
                }
                return card
            })

            // Map Urgent Flags
            let urgentFlagsCount = 0
            const urgentFlags = Object.entries(data.urgent_flags ?? {})
                .filter(([_, val]) => val > 0)
                .map(([key, val], index) => {
                    urgentFlagsCount += val
                    let color = '#FEBD09'
                    let icon = 'warning'

                    if (key.includes('medical')) {
                        color = '#DC2626'
                        icon = 'medical'
                    } else if (key.includes('flood')) {
                        color = '#30A2F3'
                        icon = 'flood'
                    }

                    return {
                        id: index,
                        type: key
                            .split('_')
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(' '),
                        location: `${val} active incident${val !== 1 ? 's' : ''}`,
                        time: 'Now',
                        color,
                        icon,
                    }
                })

            return {
                ...data,
                checkinData,
                hazardData,
                workloadData: fallbackWorkloadData, // Keep fallback for now as per user request
                urgentFlags,
                urgentFlagsCount,
                statCards,
            }
        },
    })
}

export type DashboardMapData = DashboardMapResponse & { markers: MapPoint[] }

function inferHubCategory(name: string): string {
    const lower = name.toLowerCase()
    if (lower.includes('shelter') || lower.includes('refuge')) return 'Emergency Shelter'
    if (lower.includes('medical') || lower.includes('clinic') || lower.includes('hospital')) return 'Medical Center'
    if (lower.includes('command') || lower.includes('control')) return 'Command Center'
    return 'Charging Station'
}

export function useDashboardMap(
    bounds?: { lat_min?: number; lat_max?: number; lng_min?: number; lng_max?: number },
    type?: string,
    category?: string
) {
    const stableKey = dashboardKeys.map([
        bounds?.lat_min,
        bounds?.lat_max,
        bounds?.lng_min,
        bounds?.lng_max,
        type,
        category,
    ])

    return useQuery<DashboardMapResponse, Error, DashboardMapData>({
        queryKey: stableKey,
        queryFn: () => getDashboardMap(bounds, type, category),
        staleTime: 60_000,
        placeholderData: keepPreviousData,
        select: (data) => {
            const hubMarkers: MapPoint[] = (data.medical_hubs?.locations ?? []).map((hub) => {
                const category = inferHubCategory(hub.name)
                return {
                    id: hub.id,
                    lat: hub.latitude,
                    lng: hub.longitude,
                    type: category,
                    entityType: 'hub',
                    name: hub.name,
                    ...getMapConfig('hub', category),
                }
            })

            const hazardMarkers: MapPoint[] = (data.hazards ?? []).map((hazard) => {
                const category = hazard.category.charAt(0).toUpperCase() + hazard.category.slice(1)
                return {
                    id: hazard.id,
                    lat: hazard.latitude,
                    lng: hazard.longitude,
                    type: category,
                    entityType: 'hazard',
                    name: hazard.description ? `${category}: ${hazard.description}` : `${category} Incident`,
                    ...getMapConfig('hazard', category),
                }
            })

            const fallMarkers: MapPoint[] = (data.fall_incidents ?? []).map((fall) => ({
                id: fall.id,
                lat: fall.latitude,
                lng: fall.longitude,
                type: 'Fallen Tree',
                entityType: 'hazard',
                name: 'Fallen Tree Blockage',
                ...getMapConfig('hazard', 'Fallen Tree'),
            }))

            const medicalNeedMarkers: MapPoint[] = (data.medical_needs ?? []).map((med) => ({
                id: med.id,
                lat: med.latitude,
                lng: med.longitude,
                type: 'Medical Emergency',
                entityType: 'hazard',
                name: 'Urgent Medical Emergency',
                ...getMapConfig('hazard', 'Medical Emergency'),
            }))

            return {
                ...data,
                markers: [...hubMarkers, ...hazardMarkers, ...fallMarkers, ...medicalNeedMarkers],
            }
        },
    })
}
