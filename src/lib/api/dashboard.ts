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
