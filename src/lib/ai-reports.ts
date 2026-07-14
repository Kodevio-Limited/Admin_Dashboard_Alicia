import { client, toQuery } from './api-client'

export interface Report {
    id: number
    time: string
    title: string
    summary: string
    description: string
    stats: {
        totalCheckIns: string
        activeHazards: string
        urgentFlags: string
        silentZones: string
    }
    criticalSignals: string[]
    affectedAreas: string[]
    tacticalInsights: string
}

export type MessageReviewStatus = 'reviewed' | 'pending' | 'escalated' | 'resolved'

// Matches the exact shape returned by GET /ai/message-review/ and GET /ai/message-review/{source}/{id}/
export interface MessageReviewItem {
    id: number
    source: 'hazard' | 'checkin'
    message: string
    hazard_type: string | null
    severity: number | null
    risk_score: number | null
    review_status: MessageReviewStatus
    reporter: string
    hub_name: string | null
    latitude: number | null
    longitude: number | null
    photo_url: string | null
    created_at: string
}

// UI-friendly shape used in the table and modals
export interface MessageReviewRow {
    id: number
    source: 'hazard' | 'checkin'
    preview: string
    resident: string
    status: MessageReviewStatus
    time: string
    hub_name: string | null
    hazardType: string | null
    severity: number | null
    risk_score: number | null
    latitude: number | null
    longitude: number | null
    photo_url: string | null
}

export interface MessageReviewPage {
    count: number
    next: string | null
    previous: string | null
    results: MessageReviewRow[]
}

// Raw paginated shape straight from the API (before mapping)
interface MessageReviewApiPage {
    count: number
    next: string | null
    previous: string | null
    results: MessageReviewItem[]
}

export interface ReportHistoryItem {
    id: number
    summary: string
    generated_by: 'ai' | 'manual' | string
    is_auto: boolean
    pdf_url: string | null
    created_at: string
    updated_at: string
}

export interface AIControlConfig {
    confidence_threshold: number
    autonomous_classification: boolean
    review_report_frequency: string
    updated_at?: string
}

export interface AIReportingConfig {
    auto_reporting_enabled: boolean
    frequency_interval_minutes: number
    include_activity_summary: boolean
    include_hubs_summary: boolean
    include_alerts_summary: boolean
    include_ai_performance: boolean
    use_ai_summary: boolean
}

interface ApiResponse<T> {
    status: string
    data: T
    message?: string
}

// Map raw backend item → UI row
export function mapBackendMessageReview(item: MessageReviewItem): MessageReviewRow {
    return {
        id: item.id,
        source: item.source,
        preview: item.message || '',
        resident: item.reporter || `User #${item.id}`,
        status: (item.review_status || 'pending') as MessageReviewStatus,
        time: item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown',
        hub_name: item.hub_name ?? null,
        hazardType: item.hazard_type ?? null,
        severity: item.severity ?? null,
        risk_score: item.risk_score ?? null,
        latitude: item.latitude ?? null,
        longitude: item.longitude ?? null,
        photo_url: item.photo_url ?? null,
    }
}

// Paginated page shape for the reports list
export interface ReportHistoryPage {
    count: number
    next: string | null
    previous: string | null
    results: ReportHistoryItem[]
}

// Map backend to ReportHistoryItem (already matches — passthrough with safe defaults)
export function mapBackendReportHistory(item: any): ReportHistoryItem {
    return {
        id: item.id,
        summary: item.summary || '',
        generated_by: item.generated_by || 'ai',
        is_auto: !!item.is_auto,
        pdf_url: item.pdf_url ?? null,
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
    }
}

// GET AI Control Config
export async function getControlConfig(): Promise<AIControlConfig> {
    const res = await client<ApiResponse<AIControlConfig>>('/ai/control-config/')
    return res.data
}

// PUT AI Control Config
export async function updateControlConfig(payload: Partial<AIControlConfig>): Promise<AIControlConfig> {
    const res = await client<ApiResponse<AIControlConfig>>('/ai/control-config/', {
        method: 'PUT',
        data: payload,
    })
    return res.data
}

// GET AI Reporting Config
export async function getReportingConfig(): Promise<AIReportingConfig> {
    const res = await client<ApiResponse<AIReportingConfig>>('/ai/reporting-config/')
    return res.data
}

// PUT AI Reporting Config
export async function updateReportingConfig(payload: Partial<AIReportingConfig>): Promise<AIReportingConfig> {
    const res = await client<ApiResponse<AIReportingConfig>>('/ai/reporting-config/', {
        method: 'PUT',
        data: payload,
    })
    return res.data
}

// GET Message Review Queue — paginated list
export async function fetchMessageReviews(params?: {
    status?: string
    severity?: number
    source?: string
    page?: number
    limit?: number
}): Promise<MessageReviewPage> {
    const query = toQuery(params || {})
    const res = await client<MessageReviewApiPage>(`/ai/message-review/${query}`)
    return {
        count: res.count ?? 0,
        next: res.next ?? null,
        previous: res.previous ?? null,
        results: (res.results ?? []).map(mapBackendMessageReview),
    }
}

// GET Review Item details (single item by type + id)
export async function getReviewItemDetails(type: 'hazard' | 'checkin', id: number): Promise<MessageReviewRow> {
    const endpoint = `/ai/message-review/${type}/${id}/`
    const res = await client<ApiResponse<MessageReviewItem>>(endpoint)
    return mapBackendMessageReview(res.data)
}

// PATCH Review Item status
export async function updateReviewItemStatus(type: 'hazard' | 'checkin', id: number, status: string): Promise<any> {
    const endpoint = `/ai/message-review/${type}/${id}/`
    return client<ApiResponse<any>>(endpoint, {
        method: 'PATCH',
        data: { review_status: status },
    })
}

// GET Reports list — paginated, same response shape as message-review (no { status, data } wrapper)
export async function fetchReportHistory(params?: { page?: number; limit?: number }): Promise<ReportHistoryPage> {
    const query = toQuery(params || {})
    const res = await client<any>(`/ai/reports/${query}`)

    // The API returns the paginated result directly: { count, next, previous, results } or a flat array [{...}]
    // Some environments may also wrap in { status, data, message } — handle both.

    // If it's already our expected shape with a .results array, use it directly
    if (res && typeof res === 'object' && 'results' in res && Array.isArray(res.results)) {
        return {
            count: res.count ?? 0,
            next: res.next ?? null,
            previous: res.previous ?? null,
            results: res.results.map(mapBackendReportHistory),
        }
    }

    // If it's a flat array
    if (Array.isArray(res)) {
        const items = res.map(mapBackendReportHistory)
        return { count: items.length, next: null, previous: null, results: items }
    }

    // Possibly wrapped in { status, data: {...} } from some environments
    const payload = res?.data ?? []
    if (Array.isArray(payload)) {
        const items = payload.map(mapBackendReportHistory)
        return { count: items.length, next: null, previous: null, results: items }
    }
    if (payload && typeof payload === 'object' && 'results' in payload) {
        return {
            count: payload.count ?? 0,
            next: payload.next ?? null,
            previous: payload.previous ?? null,
            results: (payload.results ?? []).map(mapBackendReportHistory),
        }
    }

    return { count: 0, next: null, previous: null, results: [] }
}

// POST Generate Report
export async function generateReport(): Promise<any> {
    return client<ApiResponse<any>>('/ai/reports/', {
        method: 'POST',
    })
}

// DELETE Report
export async function deleteReport(id: number): Promise<boolean> {
    await client<ApiResponse<any>>(`/ai/reports/${id}/`, {
        method: 'DELETE',
    })
    return true
}

// Fetch single report details
export async function getReportDetails(id: number): Promise<Report> {
    const res = await client<ApiResponse<Report>>(`/ai/reports/${id}/`)
    return res.data
}

// PATCH Report item (partial update for inline editing)
export async function updateReportItem(id: number, data: { summary?: string; is_auto?: boolean }): Promise<any> {
    return client<ApiResponse<any>>(`/ai/reports/${id}/`, {
        method: 'PATCH',
        data,
    })
}

// Stub function to maintain backwards compatibility
export async function fetchReports(): Promise<Report[]> {
    const res = await client<any>('/ai/reports/')

    // Direct paginated shape: { count, next, previous, results }
    if (res && typeof res === 'object' && 'results' in res && Array.isArray(res.results)) {
        return res.results
    }

    // Flat array: [{...}]
    if (Array.isArray(res)) {
        return res
    }

    // Wrapped: { status, data: [...] }
    const payload = res?.data
    if (Array.isArray(payload)) {
        return payload
    }
    // Wrapped with results: { status, data: { results: [...] } }
    if (payload && typeof payload === 'object' && 'results' in payload && Array.isArray(payload.results)) {
        return payload.results
    }

    return []
}

// Stub function to maintain backwards compatibility — delegates to the proper API functions
export function getReportById(id: number): Promise<Report | undefined> {
    return getReportDetails(id).catch(() => undefined)
}

// Stub function to maintain backwards compatibility
export async function createReport(data: Omit<Report, 'id'>): Promise<Report> {
    const res = await client<any>('/ai/reports/', {
        method: 'POST',
        data,
    })
    // Response may be the created object directly or wrapped in { status, data }
    if (res && typeof res === 'object' && 'id' in res) {
        return res as Report
    }
    return res?.data as Report ?? data as unknown as Report
}

// Stub function to maintain backwards compatibility
export async function updateReport(id: number, data: Partial<Report>): Promise<Report | undefined> {
    try {
        const res = await client<any>(`/ai/reports/${id}/`, {
            method: 'PUT',
            data,
        })
        // Response may be the updated object directly or wrapped in { status, data }
        if (res && typeof res === 'object' && 'id' in res) {
            return res as Report
        }
        return res?.data as Report ?? undefined
    } catch {
        return undefined
    }
}
