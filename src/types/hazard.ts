export interface HazardDetail {
    id: number
    category: string
    description: string
    photo: string | null
    latitude: string
    longitude: string
    severity: number
    source: string
    status: string
    period: string
    reporter: string
    reporter_name: string
    hub: number
    client_uuid: string | null
    created_at: string
    updated_at: string
}
