import { Card, CardContent } from '@/components/ui/card'
import { BriefcaseMedical, TrafficCone, TreePine, Waves, BatteryWarning } from 'lucide-react'

interface MapLegendPanelProps {
    showLegend: boolean
    isNavigating: boolean
}

function LegendItem({
    color,
    label,
    icon: Icon,
    active = true,
}: {
    color: string
    label: string
    icon: React.ElementType
    active?: boolean
}) {
    return (
        <div className={`flex items-center gap-3 ${active ? 'opacity-100' : 'opacity-60'}`}>
            <div
                className="size-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}20`, color }}
            >
                <Icon className="size-4" strokeWidth={2.5} />
            </div>
            <span className={`font-medium text-sm ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
            </span>
        </div>
    )
}

export function MapLegendPanel({ showLegend, isNavigating }: MapLegendPanelProps) {
    if (!showLegend || isNavigating) return null

    return (
        <Card className="absolute bottom-6 left-6 z-10 w-auto bg-white border-none shadow-lg rounded-2xl">
            <CardContent className="p-5">
                <h3 className="font-semibold text-sm mb-4 text-slate-900">Severity Indicator</h3>
                <div className="flex gap-10">
                    <div className="flex flex-col gap-3.5">
                        <LegendItem color="#DC2626" label="Medical" icon={BriefcaseMedical} />
                        <LegendItem color="#FEBD09" label="Road Block" icon={TrafficCone} />
                        <LegendItem color="#30A2F3" label="Flooding" icon={Waves} />
                    </div>
                    <div className="flex flex-col gap-3.5">
                        <LegendItem color="#008A00" label="Hub" icon={BatteryWarning} />
                        <LegendItem color="#FEBD09" label="Fallen Tree" icon={TreePine} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
