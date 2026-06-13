export interface CheckinDataPoint {
    time: string
    value: number
}

export interface HazardDataPoint {
    name: string
    value: number
}

export interface OverviewData {
    checkinData: CheckinDataPoint[]
    hazardData: HazardDataPoint[]
}

export let OVERVIEW_DATA: OverviewData = {
    checkinData: [
        { time: '00:00', value: 5000 },
        { time: '03:00', value: 8000 },
        { time: '06:00', value: 12000 },
        { time: '09:00', value: 18000 },
        { time: '12:00', value: 22000 },
        { time: '15:00', value: 27000 },
        { time: '20:00', value: 25000 },
    ],
    hazardData: [
        { name: 'Infrastructure', value: 40 },
        { name: 'Medical', value: 60 },
        { name: 'Fire', value: 80 },
        { name: 'Flood', value: 110 },
    ],
}

export async function fetchOverviewData(): Promise<OverviewData> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return OVERVIEW_DATA
}

export function updateOverviewData(data: Partial<OverviewData>): OverviewData {
    OVERVIEW_DATA = { ...OVERVIEW_DATA, ...data }
    return OVERVIEW_DATA
}
