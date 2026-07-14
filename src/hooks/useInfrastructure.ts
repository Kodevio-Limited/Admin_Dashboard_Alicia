import { useQuery } from '@tanstack/react-query'
import { getInfrastructureDetail } from '@/data/infrastructure'
import { dashboardKeys } from './keys'
import type { AdminHubDetail } from '@/data/infrastructure'

export function useInfrastructureDetail(id: number) {
    return useQuery<AdminHubDetail, Error>({
        queryKey: dashboardKeys.infrastructureDetail(id),
        queryFn: () => getInfrastructureDetail(id),
        enabled: !!id,
    })
}
