import { client } from '../api-client'

export interface ResidentAPIResult {
    phone_number: string
    full_name: string
    email: string | null
    role: string
    is_active: boolean
    hub_name: string | null
    community: string | null
    last_checkin: string | null
    profile_photo: string | null
    household_size: number | null
    created_at: string
}

export interface ResidentDetails extends ResidentAPIResult {
    medical_needs: string | null
    latitude: string | null
    longitude: string | null
    checkins_count: number
}

export interface ApiResponse<T> {
    status: string
    data: T
    message?: string
}

export interface HubAPIResult {
    id: number
    name: string
    address: string
    status: 'open' | 'closed' | 'critical' | 'low_battery'
    battery_percentage: number
    starlink_status: boolean
    coordinator_name: string | null
    residents_count: number
}

export interface CoordinatorAPIResult {
    phone_number: string
    full_name: string
    email: string | null
    is_active: boolean
    hub_name: string | null
    created_at: string
}

export interface PaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
}

export interface GetResidentsParams {
    page?: number
    limit?: number
    search?: string
    hub_id?: number
    is_active?: boolean
}

export async function getResidents(params: GetResidentsParams = {}): Promise<PaginatedResponse<ResidentAPIResult>> {
    const urlParams = new URLSearchParams()

    if (params.page) urlParams.set('page', params.page.toString())
    if (params.limit) urlParams.set('limit', params.limit.toString())
    if (params.search) urlParams.set('search', params.search)
    if (params.hub_id !== undefined) urlParams.set('hub_id', params.hub_id.toString())
    if (params.is_active !== undefined) urlParams.set('is_active', params.is_active.toString())

    const queryString = urlParams.toString()
    const endpoint = `/admin/residents/${queryString ? `?${queryString}` : ''}`

    return client<PaginatedResponse<ResidentAPIResult>>(endpoint)
}

export async function getResidentDetails(userId: string): Promise<ResidentDetails> {
    const response = await client<ApiResponse<ResidentDetails>>(`/admin/residents/${userId}/`)
    return response.data
}

export async function activateResident(userId: string): Promise<ResidentAPIResult> {
    const response = await client<ApiResponse<ResidentAPIResult>>(`/admin/residents/${userId}/activate/`, {
        method: 'PATCH',
    })
    return response.data
}

export async function suspendResident(userId: string): Promise<ResidentAPIResult> {
    const response = await client<ApiResponse<ResidentAPIResult>>(`/admin/residents/${userId}/suspend/`, {
        method: 'PATCH',
    })
    return response.data
}

export interface GetHubsParams {
    page?: number
    limit?: number
    search?: string
    status?: string
}

export async function getHubs(params: GetHubsParams = {}): Promise<PaginatedResponse<HubAPIResult>> {
    const urlParams = new URLSearchParams()

    if (params.page) urlParams.set('page', params.page.toString())
    if (params.limit) urlParams.set('limit', params.limit.toString())
    if (params.search) urlParams.set('search', params.search)
    if (params.status) urlParams.set('status', params.status)

    const queryString = urlParams.toString()
    const endpoint = `/admin/hubs/${queryString ? `?${queryString}` : ''}`

    return client<PaginatedResponse<HubAPIResult>>(endpoint)
}

export interface GetCoordinatorsParams {
    page?: number
    limit?: number
    search?: string
    hub_id?: number
    is_active?: boolean
}

export async function getCoordinators(params: GetCoordinatorsParams = {}): Promise<PaginatedResponse<CoordinatorAPIResult>> {
    const urlParams = new URLSearchParams()

    if (params.page) urlParams.set('page', params.page.toString())
    if (params.limit) urlParams.set('limit', params.limit.toString())
    if (params.search) urlParams.set('search', params.search)
    if (params.hub_id !== undefined) urlParams.set('hub_id', params.hub_id.toString())
    if (params.is_active !== undefined) urlParams.set('is_active', params.is_active.toString())

    const queryString = urlParams.toString()
    const endpoint = `/admin/coordinators/${queryString ? `?${queryString}` : ''}`

    return client<PaginatedResponse<CoordinatorAPIResult>>(endpoint)
}

export interface CreateHubPayload {
    name: string
    address: string
    latitude: number
    longitude: number
    max_concurrent_bookings: number
    coordinator_id?: string
}

export async function createHub(payload: CreateHubPayload): Promise<ApiResponse<HubAPIResult>> {
    return client<ApiResponse<HubAPIResult>>('/admin/hubs/create/', {
        method: 'POST',
        data: payload,
    })
}

export interface AssignCoordinatorPayload {
    coordinator_id: string
}

export async function assignCoordinator(hubId: number, payload: AssignCoordinatorPayload): Promise<ApiResponse<any>> {
    return client<ApiResponse<any>>(`/admin/hubs/${hubId}/assign-coordinator/`, {
        method: 'PATCH',
        data: payload,
    })
}

export interface ReassignCoordinatorPayload {
    new_coordinator_id: string
}

export async function reassignCoordinator(hubId: number, payload: ReassignCoordinatorPayload): Promise<ApiResponse<any>> {
    return client<ApiResponse<any>>(`/admin/hubs/${hubId}/reassign-coordinator/`, {
        method: 'PATCH',
        data: payload,
    })
}

export interface UserAPIResult {
    phone_number: string
    full_name: string
    email: string | null
    role: string
    is_active: boolean
    hub_name: string | null
    created_at: string
}

export interface GetUsersParams {
    page?: number
    limit?: number
    search?: string
    role?: string
    is_active?: boolean
}

export async function getUsers(params: GetUsersParams = {}): Promise<PaginatedResponse<UserAPIResult>> {
    const urlParams = new URLSearchParams()

    if (params.page) urlParams.set('page', params.page.toString())
    if (params.limit) urlParams.set('limit', params.limit.toString())
    if (params.search) urlParams.set('search', params.search)
    if (params.role) urlParams.set('role', params.role)
    if (params.is_active !== undefined) urlParams.set('is_active', params.is_active.toString())

    const queryString = urlParams.toString()
    const endpoint = `/admin/users/${queryString ? `?${queryString}` : ''}`

    return client<PaginatedResponse<UserAPIResult>>(endpoint)
}

export interface UpdateUserPayload {
    role?: string
}

export async function updateUser(phone: string, payload: UpdateUserPayload): Promise<ApiResponse<UserAPIResult>> {
    return client<ApiResponse<UserAPIResult>>(`/admin/users/${phone}/`, {
        method: 'PATCH',
        data: payload,
    })
}

