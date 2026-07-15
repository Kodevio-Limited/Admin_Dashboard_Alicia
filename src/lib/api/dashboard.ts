import { client } from '../api-client'

export interface AdminDashboardOverviewResponse {
    status: string
    data: {
        checkins: {
            total: number
            today: number
            safe: number
            need_assistance: number
        }
        active_hubs: number
        hazard_reports: number
        silent_communications: number
        urgent_flags: {
            medical_roadblocks: number
            flooding: number
        }
        checkins_over_time: {
            bucket: string
            count: number
        }[]
        hazard_breakdown: {
            flooding: number
            fire: number
            medical: number
            [key: string]: number
        }
        users: {
            total: number
            residents: number
            coordinators: number
            active: number
        }
        messages: {
            inbound_today: number
            unclassified: number
        }
    }
    message: string
}

export async function getAdminOverview(): Promise<AdminDashboardOverviewResponse> {
    return client<AdminDashboardOverviewResponse>('/admin/overview/')
}

export interface UrgentFlagResult {
    id: number
    category: string
    category_label: string
    description: string
    latitude: number
    longitude: number
    severity: number
    severity_label: string
    reporter_name: string
    status: string
    review_status: string
    risk_score: number
    photo: string | null
    created_at: string
}

export interface UrgentFlagsResponse {
    status: string
    data: {
        hazard_breakdown: {
            [key: string]: number
        }
        checkins: {
            total: number
            today: number
            safe: number
            need_assistance: number
        }
        count: number
        next: string | null
        previous: string | null
        results: UrgentFlagResult[]
    }
    message: string
}

export async function getUrgentFlagsList(category?: string, page?: number): Promise<UrgentFlagsResponse> {
    let url = '/gov/urgent-flags/'
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (page) params.append('page', page.toString())

    const qs = params.toString()
    if (qs) url += `?${qs}`
    return client<UrgentFlagsResponse>(url)
}
