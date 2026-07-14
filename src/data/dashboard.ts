import { client } from '@/lib/api-client'
import type { DashboardMapResponse } from '@/types/dashboard'

export async function getDashboardMap(
    bounds?: {
        lat_min?: number
        lat_max?: number
        lng_min?: number
        lng_max?: number
    },
    type?: string,
    category?: string
): Promise<DashboardMapResponse> {
    let url = '/gov/map/'
    const params = new URLSearchParams()
    if (bounds) {
        if (bounds.lat_min !== undefined) params.append('lat_min', bounds.lat_min.toString())
        if (bounds.lat_max !== undefined) params.append('lat_max', bounds.lat_max.toString())
        if (bounds.lng_min !== undefined) params.append('lng_min', bounds.lng_min.toString())
        if (bounds.lng_max !== undefined) params.append('lng_max', bounds.lng_max.toString())
    }
    if (type) params.append('type', type)
    if (category) params.append('category', category)

    const qs = params.toString()
    if (qs) url += `?${qs}`

    const response = await client<{ status: string; data: DashboardMapResponse }>(url)
    return response.data
}
