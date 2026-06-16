export interface CheckinDataPoint {
    time: string
    value: number
}

export interface HazardDataPoint {
    name: string
    value: number
}

export interface WorkloadDataPoint {
    name: string
    value: number
    color: string
}

export interface UrgentFlag {
    id: number
    type: string
    location: string
    time: string
    color: string
    icon: string
}

export interface StatCardData {
    label: string
    value: string
    trend?: {
        value: string
        direction: 'up' | 'down'
        label: string
    }
    iconName: string
    color: string
}

export const checkInTrendData: CheckinDataPoint[] = [
    { time: '00:00', value: 8500 },
    { time: '01:00', value: 7200 },
    { time: '02:00', value: 6800 },
    { time: '03:00', value: 9200 },
    { time: '04:00', value: 15000 },
    { time: '05:00', value: 22000 },
    { time: '06:00', value: 26000 },
    { time: '07:00', value: 28000 },
    { time: '08:00', value: 24000 },
    { time: '09:00', value: 25500 },
    { time: '10:00', value: 22000 },
    { time: '11:00', value: 23000 },
]

export const hazardData: HazardDataPoint[] = [
    { name: 'Flood', value: 120 },
    { name: 'Fire', value: 90 },
    { name: 'Medical', value: 70 },
    { name: 'Infrastructure', value: 55 },
]

export const workloadData: WorkloadDataPoint[] = [
    { name: 'Check in', value: 51, color: '#8979FF' },
    { name: 'Alerts', value: 14, color: '#FF928A' },
    { name: 'AI Sync', value: 35, color: '#3CC3DF' },
]

export const urgentFlags: UrgentFlag[] = [
    {
        id: 1,
        type: 'Medical',
        location: 'Haining Road, Kingston 5, Jamaica',
        time: '12 mins ago',
        color: '#DC2626',
        icon: 'medical',
    },
    {
        id: 2,
        type: 'Road Block',
        location: 'Haining Road, Kingston 5, Jamaica',
        time: '12 mins ago',
        color: '#FEBD09',
        icon: 'warning',
    },
    {
        id: 3,
        type: 'Flooding',
        location: 'Haining Road, Kingston 5, Jamaica',
        time: '12 mins ago',
        color: '#30A2F3',
        icon: 'flood',
    },
    {
        id: 4,
        type: 'Hub',
        location: 'Haining Road, Kingston 5, Jamaica',
        time: '12 mins ago',
        color: '#008A00',
        icon: 'battery',
    },
]

export const statCardsData: StatCardData[] = [
    { label: 'Residents Checked-in', value: '1,250', trend: { value: '12.5%', direction: 'up', label: 'vs Last Period' }, iconName: 'Users', color: 'emerald' },
    { label: 'Active Hubs', value: '18/20', trend: { value: '12.5%', direction: 'up', label: 'vs Last Period' }, iconName: 'Activity', color: 'blue' },
    { label: 'Coordinators Active', value: '24', trend: { value: '12.5%', direction: 'up', label: 'vs Last Period' }, iconName: 'CheckCircle', color: 'amber' },
    { label: 'Gov/NGO Licenses', value: '5', iconName: 'ShieldCheck', color: 'slate' },
    { label: 'Open Alerts', value: '3', trend: { value: '12.5%', direction: 'up', label: 'vs Last Period' }, iconName: 'AlertCircle', color: 'rose' },
]

export interface OverviewData {
    checkinData: CheckinDataPoint[]
    hazardData: HazardDataPoint[]
    workloadData: WorkloadDataPoint[]
    urgentFlags: UrgentFlag[]
    statCards: StatCardData[]
}

export let OVERVIEW_DATA: OverviewData = {
    checkinData: checkInTrendData,
    hazardData: hazardData,
    workloadData: workloadData,
    urgentFlags: urgentFlags,
    statCards: statCardsData,
}

export async function fetchOverviewData(): Promise<OverviewData> {
    // Simulate network delay
    return OVERVIEW_DATA
}

export function updateOverviewData(data: Partial<OverviewData>): OverviewData {
    OVERVIEW_DATA = { ...OVERVIEW_DATA, ...data }
    return OVERVIEW_DATA
}
