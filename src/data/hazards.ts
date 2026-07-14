import { client } from '@/lib/api-client'
import type { HazardDetail } from '@/types/hazard'

export async function getHazardDetail(id: number): Promise<HazardDetail> {
    const response = await client<{ status: string; data: HazardDetail }>(`/gov/hazards/${id}/`)
    return response.data
}
