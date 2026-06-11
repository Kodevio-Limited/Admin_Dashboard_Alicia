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
import { Search, Clock, TrendingUp, HeartPulse, TriangleAlert, Waves, BatteryWarning } from 'lucide-react'
import { PageHeader } from '#/components/ui/page-header'

export const Route = createFileRoute('/__main/')({
    component: Dashboard,
})

const checkInTrendData = [
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

const hazardData = [
    { name: 'Flood', value: 120 },
    { name: 'Fire', value: 90 },
    { name: 'Medical', value: 70 },
    { name: 'Infrastructure', value: 55 },
]

const workloadData = [
    { name: 'Check in', value: 268.61, color: '#8979FF' },
    { name: 'Alerts', value: 93.12, color: '#FF928A' },
    { name: 'AI Sync', value: 184.16, color: '#3CC3DF' },
]

const urgentFlags = [
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

function FlagIcon({ type, color }: { type: string; color: string }) {
    return (
        <div className="relative shrink-0 size-[48px] rounded-full bg-[#f2f2f2] flex items-center justify-center">
            <div
                className="absolute inset-0 rounded-full flex items-center justify-center m-1 shadow-sm"
                style={{ backgroundColor: color }}
            />
            <div className="relative z-10 text-white flex items-center justify-center">
                {type === 'medical' && <HeartPulse className="size-[22px]" />}
                {type === 'warning' && <TriangleAlert className="size-[22px]" fill="white" />}
                {type === 'flood' && <Waves className="size-[22px]" />}
                {type === 'battery' && <BatteryWarning className="size-[22px]" fill="white" />}
            </div>
        </div>
    )
}

function Dashboard() {
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
        <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden pb-8 font-sans">
            <PageHeader title="Dashboard" description="System status overview" lastUpdated={currentTime} />
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 shrink-0">
                {[
                    { label: 'Residents Checked-in', value: '1,250', trend: true },
                    { label: 'Active Hubs', value: '18/20', trend: true },
                    { label: 'Coordinators Active', value: '24', trend: true },
                    { label: 'Gov/NGO Licenses', value: '5', trend: false },
                    { label: 'Open Alerts', value: '3', trend: true },
                ].map((card) => (
                    <div
                        key={card.label}
                        className="bg-white rounded-[16px] px-6 py-5 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                        <div>
                            <p className="text-[#989898] text-[15px] font-medium mb-2 line-clamp-1">{card.label}</p>
                            <p className="text-slate-900 text-[32px] font-bold mb-4 tracking-tight leading-none">{card.value}</p>
                        </div>
                        {card.trend ? (
                            <div className="flex items-center gap-1.5 mt-2">
                                <TrendingUp className="size-4 text-emerald-600 stroke-[2.5]" />
                                <span className="text-emerald-600 text-[13px] font-semibold">12.5% vs Last Period</span>
                            </div>
                        ) : (
                            <div className="h-[26px] mt-2" />
                        )}
                    </div>
                ))}
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-auto lg:h-[440px]">
                {/* Check-ins trend */}
                <div className="bg-white rounded-[16px] xl:col-span-8 p-7 flex flex-col shadow-sm border border-slate-100">
                    <h2 className="text-[#1e1e20] text-[22px] font-bold mb-1">Residents Check-ins Trend</h2>
                    <p className="text-[#989898] text-[15px] mb-8 font-medium">Network-wide check-in volume over the last 6 hours</p>
                    <div className="flex-1 min-h-[300px] lg:min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={checkInTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    </div>
                </div>

                {/* Urgent Flags */}
                <div className="bg-white rounded-[16px] xl:col-span-4 p-7 flex flex-col shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-[#1e1e20] text-[22px] font-bold">Urgent Flags</h2>
                        <span className="bg-rose-100/80 text-rose-600 text-[13px] font-bold px-4 py-1.5 rounded-full">6 Active</span>
                    </div>
                    <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2">
                        {urgentFlags.map((flag) => (
                            <div
                                key={flag.id}
                                className="flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 p-2 -mx-2 rounded-xl transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <FlagIcon type={flag.icon} color={flag.color} />
                                    <div className="flex flex-col gap-1">
                                        <p className="text-slate-900 text-[16px] font-bold group-hover:text-blue-700 transition-colors">
                                            {flag.type}
                                        </p>
                                        <p
                                            className="text-[#686868] text-[13px] font-medium leading-tight max-w-[160px] truncate"
                                            title={flag.location}
                                        >
                                            {flag.location}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-[#989898] text-[13px] font-semibold shrink-0 ml-2">{flag.time}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-auto lg:h-[440px]">
                {/* Hazard Types */}
                <div className="bg-white rounded-[16px] p-7 flex flex-col shadow-sm border border-slate-100">
                    <h2 className="text-[#1e1e20] text-[22px] font-bold mb-8">Hazard Types</h2>
                    <div className="flex-1 min-h-[300px] lg:min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hazardData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }} barSize={32}>
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
                    </div>
                </div>

                {/* System Workload */}
                <div className="bg-white rounded-[16px] p-7 flex flex-col shadow-sm border border-slate-100">
                    <h2 className="text-[#1e1e20] text-[22px] font-bold mb-4">System Workload</h2>
                    <div className="flex-1 min-h-[300px] lg:min-h-0 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={workloadData}
                                    cx="40%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={135}
                                    dataKey="value"
                                    paddingAngle={1.5}
                                    label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
                                        const RADIAN = Math.PI / 180
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
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
                                                fontWeight={600}
                                            >
                                                <tspan x={x} dy="-8">
                                                    {name}
                                                </tspan>
                                                <tspan x={x} dy="18" fontWeight="700">
                                                    {value.toFixed(1)}
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
                                    formatter={(value) => <span className="text-slate-800 font-semibold text-[15px] ml-2">{value}</span>}
                                    iconType="circle"
                                    iconSize={14}
                                    verticalAlign="middle"
                                    align="right"
                                    layout="vertical"
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                    formatter={(v: any) => [Number(v).toFixed(2), 'Value']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
