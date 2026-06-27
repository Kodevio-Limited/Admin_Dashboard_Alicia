import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    Legend,
} from 'recharts'
import { HeartPulse, TriangleAlert, Waves, BatteryWarning, Users, Activity, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react'
import { PageHeader } from '#/components/sections/page-header'
import { StatCard } from '#/components/sections/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_authenticated/')({
    component: Dashboard,
})

import { useAdminOverview } from '@/hooks/useDashboard'

function FlagIcon({ type, color }: { type: string; color: string }) {
    return (
        <div className="relative shrink-0 size-12 rounded-full bg-muted flex items-center justify-center">
            <div
                className="absolute inset-0 rounded-full flex items-center justify-center m-1 shadow-sm"
                style={{ backgroundColor: color }}
            />
            <div className="relative z-10 text-white flex items-center justify-center">
                {type === 'medical' && <HeartPulse className="size-5.5" />}
                {type === 'warning' && <TriangleAlert className="size-5.5" fill="white" />}
                {type === 'flood' && <Waves className="size-5.5" />}
                {type === 'battery' && <BatteryWarning className="size-5.5" fill="white" />}
            </div>
        </div>
    )
}

function Dashboard() {
    const { data: overviewData, isLoading } = useAdminOverview()
    const {
        checkinData = [],
        hazardData = [],
        workloadData = [],
        urgentFlags = [],
        urgentFlagsCount = 0,
        statCards = [],
    } = overviewData || {}
    const [currentTime, setCurrentTime] = useState('')

    useEffect(() => {
        const update = () => {
            const now = new Date()
            setCurrentTime(
                now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }),
            )
        }
        update()
        const id = setInterval(update, 1000)
        return () => clearInterval(id)
    }, [])

    return (
        <div className="flex flex-col gap-3 w-full max-w-full overflow-hidden pb-2 font-sans">
            <PageHeader title="Dashboard" description="System status overview" lastUpdated={currentTime} />
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 shrink-0">
                {statCards.map((card) => {
                    const icons: Record<string, any> = {
                        Users,
                        Activity,
                        CheckCircle,
                        ShieldCheck,
                        AlertCircle,
                    }
                    const IconComponent = icons[card.iconName] || AlertCircle
                    return <StatCard key={card.label} {...(card as any)} icon={IconComponent} isLoading={isLoading} />
                })}
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 h-auto lg:h-110">
                {/* Check-ins trend */}
                <Card className="xl:col-span-8 p-5 md:p-6 flex flex-col min-h-[300px] lg:min-h-0">
                    <CardHeader className="px-0 pt-0 pb-2">
                        <CardTitle className="text-[22px] font-bold">Residents Check-ins Trend</CardTitle>
                        <p className="text-muted-foreground text-[15px] font-medium">Network-wide check-in volume over the last 6 hours</p>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-[300px] lg:min-h-0 w-full relative">
                        {isLoading ? (
                            <div className="w-full h-full p-4 flex flex-col gap-4">
                                <Skeleton className="h-[250px] w-full" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={checkinData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="checkinGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#03045E" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#03045E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: '#989898', fontSize: 13, fontWeight: 500 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={12}
                                    />
                                    <YAxis
                                        tick={{ fill: '#989898', fontSize: 13, fontWeight: 500 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `${v / 1000}K`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                        formatter={(v: any) => [`${Number(v).toLocaleString()}`, 'Check-ins']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#03045E"
                                        strokeWidth={3}
                                        fill="url(#checkinGradient)"
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#03045E', stroke: 'white', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Urgent Flags */}
                <Card className="xl:col-span-4 p-5 md:p-6 flex flex-col">
                    <CardHeader className="px-0 pt-0 pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-[22px] font-bold">Urgent Flags</CardTitle>
                        <span className="bg-rose-100/80 text-rose-600 text-[13px] font-bold px-4 py-1.5 rounded-full">
                            {urgentFlagsCount} Active
                        </span>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col gap-6 flex-1 overflow-y-auto pr-2">
                        {isLoading ? (
                            <div className="w-full py-4 flex flex-col gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-4 px-2">
                                        <Skeleton className="size-12 rounded-full shrink-0" />
                                        <div className="flex flex-col gap-2 w-full">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-40" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : urgentFlags.length > 0 ? (
                            urgentFlags.map((flag) => (
                                <div
                                    key={flag.id}
                                    className="flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 p-2 -mx-2 rounded-xl transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <FlagIcon type={flag.icon} color={flag.color} />
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <p className="text-slate-900 text-[16px] font-bold group-hover:text-blue-700 transition-colors">
                                                {flag.type}
                                            </p>
                                            <p
                                                className="text-muted-foreground text-[13px] font-medium leading-tight max-w-40 truncate"
                                                title={flag.location}
                                            >
                                                {flag.location}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground text-[13px] font-semibold shrink-0 ml-2">{flag.time}</p>
                                </div>
                            ))
                        ) : (
                            <div className="w-full py-10 flex items-center justify-center text-muted-foreground">No urgent flags.</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-auto lg:h-110">
                {/* Hazard Types */}
                <Card className="p-5 md:p-6 flex flex-col">
                    <CardHeader className="px-0 pt-0 pb-2">
                        <CardTitle className="text-[22px] font-bold">Hazard Types</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-[300px] lg:min-h-0 w-full relative">
                        {isLoading ? (
                            <div className="w-full h-full p-4 flex flex-col gap-6 justify-center">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-4 w-20 shrink-0" />
                                        <Skeleton className="h-6 w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={hazardData}
                                    layout="vertical"
                                    margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                                    barSize={32}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis
                                        type="number"
                                        tick={{ fill: '#989898', fontSize: 13, fontWeight: 500 }}
                                        axisLine={false}
                                        tickLine={false}
                                        ticks={[0, 30, 60, 90, 120]}
                                        dx={10}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fill: '#54555a', fontSize: 14, fontWeight: 600 }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={120}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                        cursor={{ fill: 'rgba(3,4,94,0.04)' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                        {hazardData.map((_, i) => (
                                            <Cell key={i} fill="#03045E" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* System Workload */}
                <Card className="p-5 md:p-6 flex flex-col">
                    <CardHeader className="px-0 pt-0 pb-4">
                        <CardTitle className="text-[22px] font-bold">System Workload</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-[300px] lg:min-h-0 flex items-center justify-center w-full relative">
                        {isLoading ? (
                            <Skeleton className="size-[250px] rounded-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={workloadData}
                                        cx="40%"
                                        cy="50%"
                                        outerRadius={135}
                                        dataKey="value"
                                        label={({ name, percent, cx, cy, midAngle, outerRadius }) => {
                                            const RADIAN = Math.PI / 180
                                            const radius = outerRadius * 0.6
                                            const angle = midAngle ?? 0
                                            const x = cx + radius * Math.cos(-angle * RADIAN)
                                            const y = cy + radius * Math.sin(-angle * RADIAN)
                                            return (
                                                <text
                                                    x={x}
                                                    y={y}
                                                    fill="white"
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                    fontSize={13}
                                                    fontWeight={400}
                                                >
                                                    <tspan x={x} dy="-8">
                                                        {name}
                                                    </tspan>
                                                    <tspan x={x} dy="18" fontWeight="700">
                                                        {`${((percent ?? 0) * 100).toFixed(0)}%`}
                                                    </tspan>
                                                </text>
                                            )
                                        }}
                                        labelLine={false}
                                    >
                                        {workloadData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend
                                        formatter={(value) => (
                                            <span className="text-slate-800 font-semibold text-[15px] ml-2">{value}</span>
                                        )}
                                        iconType="circle"
                                        iconSize={14}
                                        verticalAlign="middle"
                                        align="right"
                                        layout="vertical"
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                        formatter={(v: any) => [`${v}%`, 'Workload']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
