import { MapPin, BatteryWarning, TriangleAlert, BriefcaseMedical, Waves, ShieldAlert, Home, Activity } from 'lucide-react'

export interface MapPoint {
    id: number
    lng: number
    lat: number
    type: string
    entityType: 'hazard' | 'hub'
    name?: string
    icon: any
    color: string
    pulse: boolean
    size: 'sm' | 'md' | 'lg'
}

export function getMapConfig(entityType: 'hazard' | 'hub', typeCategory: string) {
    if (entityType === 'hazard') {
        switch (typeCategory) {
            case 'Medical Emergency':
                return { icon: BriefcaseMedical, color: '#DC2626', pulse: true, size: 'lg' as const }
            case 'Blocked Road':
                return { icon: TriangleAlert, color: '#FEBD09', pulse: true, size: 'lg' as const }
            case 'Flooding':
                return { icon: Waves, color: '#30A2F3', pulse: true, size: 'lg' as const }
            case 'Fallen Tree':
                return { icon: TriangleAlert, color: '#FEBD09', pulse: false, size: 'md' as const }
            case 'Fire':
                return { icon: TriangleAlert, color: '#DC2626', pulse: true, size: 'lg' as const }
            default:
                return { icon: MapPin, color: '#DC2626', pulse: true, size: 'md' as const }
        }
    } else {
        switch (typeCategory) {
            case 'Emergency Shelter':
                return { icon: Home, color: '#008A00', pulse: false, size: 'md' as const }
            case 'Medical Center':
                return { icon: Activity, color: '#008A00', pulse: false, size: 'md' as const }
            case 'Command Center':
                return { icon: ShieldAlert, color: '#008A00', pulse: false, size: 'md' as const }
            case 'Charging Station':
                return { icon: BatteryWarning, color: '#008A00', pulse: false, size: 'md' as const }
            default:
                return { icon: BatteryWarning, color: '#008A00', pulse: false, size: 'md' as const }
        }
    }
}
