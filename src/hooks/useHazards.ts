import { useQuery } from '@tanstack/react-query'
import { getHazardDetail } from '@/data/hazards'
import { dashboardKeys } from './keys'
import type { HazardDetail } from '@/types/hazard'

export function useHazardDetail(id: number | null) {
    return useQuery<HazardDetail, Error>({
        queryKey: id ? dashboardKeys.hazardDetail(id) : dashboardKeys.hazards(),
        queryFn: () => getHazardDetail(id as number),
        enabled: !!id,
    })
}
