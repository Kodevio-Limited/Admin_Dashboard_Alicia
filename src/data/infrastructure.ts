import { client } from '@/lib/api-client'

export interface AdminHubDetail {
    id: number
    name: string
    location: {
        latitude: number
        longitude: number
        address: string
    }
    status: string
    battery_percentage: number
    solar: {
        input_w: number
        output_w: number
    }
    connectivity: {
        starlink: boolean
    }
    sync: {
        last_sync_at: string
    }
}

export async function getInfrastructureDetail(id: number): Promise<AdminHubDetail> {
    const response = await client<{ status: string; data: AdminHubDetail }>(`/gov/infrastructure/${id}/`)
    return response.data
}
