import { MapPin, BatteryWarning, TriangleAlert, BriefcaseMedical, Waves } from 'lucide-react'

export interface HazardItem {
    id: number
    lng: number
    lat: number
    type: string
    icon: any
    color: string
    pulse: boolean
    size: 'sm' | 'md' | 'lg'
}

export let HAZARDS: HazardItem[] = [
    { id: 1, lng: -76.792, lat: 18.0128, type: 'Medical', icon: BriefcaseMedical, color: '#DC2626', pulse: true, size: 'lg' },
    { id: 2, lng: -76.805, lat: 18.005, type: 'Blocked Road', icon: TriangleAlert, color: '#FEBD09', pulse: true, size: 'lg' },
    { id: 3, lng: -76.78, lat: 17.995, type: 'Hub', icon: BatteryWarning, color: '#008A00', pulse: false, size: 'md' },
    { id: 4, lng: -76.785, lat: 17.985, type: 'Hub', icon: BatteryWarning, color: '#008A00', pulse: false, size: 'md' },
    { id: 5, lng: -76.8, lat: 18.001, type: 'Flooding', icon: Waves, color: '#30A2F3', pulse: true, size: 'lg' },
    { id: 6, lng: -76.795, lat: 17.99, type: 'Inactive', icon: MapPin, color: '#989898', pulse: false, size: 'md' },
    { id: 7, lng: -76.775, lat: 18.005, type: 'Fallen Tree', icon: TriangleAlert, color: '#FEBD09', pulse: false, size: 'md' },
    { id: 8, lng: -76.81, lat: 18.015, type: 'Medical', icon: BriefcaseMedical, color: '#DC2626', pulse: true, size: 'lg' },
    { id: 9, lng: -76.77, lat: 17.98, type: 'Flooding', icon: Waves, color: '#30A2F3', pulse: true, size: 'lg' },
    { id: 10, lng: -76.782, lat: 17.992, type: 'Hub', icon: BatteryWarning, color: '#008A00', pulse: false, size: 'md' },
    { id: 11, lng: -76.802, lat: 18.008, type: 'Blocked Road', icon: TriangleAlert, color: '#FEBD09', pulse: true, size: 'lg' },
    { id: 12, lng: -76.79, lat: 17.985, type: 'Inactive', icon: MapPin, color: '#989898', pulse: false, size: 'md' },
]

export async function fetchHazards(): Promise<HazardItem[]> {
    return [...HAZARDS]
}

export function getHazardById(id: number): HazardItem | undefined {
    return HAZARDS.find((h) => h.id === id)
}

export function createHazard(data: Omit<HazardItem, 'id'>): HazardItem {
    const newHazard = { id: Date.now(), ...data }
    HAZARDS = [newHazard, ...HAZARDS]
    return newHazard
}

export function updateHazard(id: number, data: Partial<HazardItem>): HazardItem | undefined {
    const index = HAZARDS.findIndex((h) => h.id === id)
    if (index !== -1) {
        HAZARDS[index] = { ...HAZARDS[index], ...data }
        return HAZARDS[index]
    }
    return undefined
}

export function deleteHazard(id: number): boolean {
    const initialLength = HAZARDS.length
    HAZARDS = HAZARDS.filter((h) => h.id !== id)
    return HAZARDS.length !== initialLength
}
