export interface DashboardMapResponse {
    medical_hubs: {
        count: number
        locations: {
            id: number
            name: string
            latitude: number
            longitude: number
        }[]
    }
    hazards: {
        id: number
        category: string
        latitude: number
        longitude: number
        severity: number
        status: string
        description: string
        created_at: string
    }[]
    fall_incidents: {
        id: number
        latitude: number
        longitude: number
        [key: string]: unknown
    }[]
    medical_needs: {
        id: number
        latitude: number
        longitude: number
        [key: string]: unknown
    }[]
}
