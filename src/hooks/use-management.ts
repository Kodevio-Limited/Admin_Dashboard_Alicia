import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getResidents, getResidentDetails, activateResident, suspendResident, getHubs, getCoordinators, createHub, assignCoordinator, reassignCoordinator, getUsers, updateUser } from '@/lib/api/management'
import { type GetResidentsParams, type GetHubsParams, type GetCoordinatorsParams, type GetUsersParams } from '@/lib/api/management'

export const managementKeys = {
    all: ['management'] as const,
    residents: () => [...managementKeys.all, 'residents'] as const,
    residentList: (params: GetResidentsParams) => [...managementKeys.residents(), params] as const,
    residentDetails: (userId: string) => [...managementKeys.residents(), 'details', userId] as const,
    hubs: () => [...managementKeys.all, 'hubs'] as const,
    hubList: (params: GetHubsParams) => [...managementKeys.hubs(), params] as const,
    coordinators: () => [...managementKeys.all, 'coordinators'] as const,
    coordinatorList: (params: GetCoordinatorsParams) => [...managementKeys.coordinators(), params] as const,
    users: () => [...managementKeys.all, 'users'] as const,
    userList: (params: GetUsersParams) => [...managementKeys.users(), params] as const,
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
            queryClient.invalidateQueries({ queryKey: managementKeys.users() })
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
            queryClient.invalidateQueries({ queryKey: managementKeys.users() })
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

export function useCreateHub() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createHub,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: managementKeys.hubs() })
        },
    })
}

export function useAssignCoordinator() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ hubId, coordinatorId }: { hubId: number; coordinatorId: string }) =>
            assignCoordinator(hubId, { coordinator_id: coordinatorId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: managementKeys.hubs() })
            queryClient.invalidateQueries({ queryKey: managementKeys.coordinators() })
        },
    })
}

export function useReassignCoordinator() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ hubId, newCoordinatorId }: { hubId: number; newCoordinatorId: string }) =>
            reassignCoordinator(hubId, { new_coordinator_id: newCoordinatorId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: managementKeys.hubs() })
            queryClient.invalidateQueries({ queryKey: managementKeys.coordinators() })
        },
    })
}

export function useUsers(params: GetUsersParams) {
    return useQuery({
        queryKey: managementKeys.userList(params),
        queryFn: () => getUsers(params),
    })
}

export function useUpdateUser() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ phone, role }: { phone: string; role: string }) => updateUser(phone, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: managementKeys.users() })
        },
    })
}
