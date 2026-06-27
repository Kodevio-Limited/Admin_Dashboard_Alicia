import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getResidents, getResidentDetails, activateResident, suspendResident, getHubs, getCoordinators } from '@/lib/api/management'
import { type GetResidentsParams, type GetHubsParams, type GetCoordinatorsParams } from '@/lib/api/management'

export const managementKeys = {
    all: ['management'] as const,
    residents: () => [...managementKeys.all, 'residents'] as const,
    residentList: (params: GetResidentsParams) => [...managementKeys.residents(), params] as const,
    residentDetails: (userId: string) => [...managementKeys.residents(), 'details', userId] as const,
    hubs: () => [...managementKeys.all, 'hubs'] as const,
    hubList: (params: GetHubsParams) => [...managementKeys.hubs(), params] as const,
    coordinators: () => [...managementKeys.all, 'coordinators'] as const,
    coordinatorList: (params: GetCoordinatorsParams) => [...managementKeys.coordinators(), params] as const,
}

export function useResidents(params: GetResidentsParams) {
    return useQuery({
        queryKey: managementKeys.residentList(params),
        queryFn: () => getResidents(params),
    })
}

export function useResidentDetails(userId: string) {
    return useQuery({
        queryKey: managementKeys.residentDetails(userId),
        queryFn: () => getResidentDetails(userId),
        enabled: !!userId,
    })
}

export function useActivateResident() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: activateResident,
        onSuccess: (data, userId) => {
            queryClient.invalidateQueries({ queryKey: managementKeys.residents() })
            queryClient.invalidateQueries({ queryKey: managementKeys.residentDetails(userId) })
        },
    })
}

export function useSuspendResident() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: suspendResident,
        onSuccess: (data, userId) => {
            queryClient.invalidateQueries({ queryKey: managementKeys.residents() })
            queryClient.invalidateQueries({ queryKey: managementKeys.residentDetails(userId) })
        },
    })
}

export function useCoordinators(params: GetCoordinatorsParams) {
    return useQuery({
        queryKey: managementKeys.coordinatorList(params),
        queryFn: () => getCoordinators(params),
    })
}

export function useHubs(params: GetHubsParams) {
    return useQuery({
        queryKey: managementKeys.hubList(params),
        queryFn: () => getHubs(params),
    })
}
