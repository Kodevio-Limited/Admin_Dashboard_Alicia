import { useState, useEffect, lazy, Suspense } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAdminOverview, useDashboardMap, useUrgentFlagsList } from '@/hooks/useDashboard'
import type { UrgentFlagResult } from '@/lib/api/dashboard'
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
import { HeartPulse, TriangleAlert, Waves, BatteryWarning, Users, Activity, CheckCircle, ShieldCheck, AlertCircle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const MapboxLiveMap = lazy(() => import('@/components/sections/mapbox-live-map').then(m => ({ default: m.MapboxLiveMap })))
import { PageHeader } from '#/components/sections/page-header'
import { StatCard } from '#/components/sections/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_authenticated/')({
    component: Dashboard,
})


function FlagIcon({ category, color }: { category: string; color: string }) {
    const isMedical = category.toLowerCase().includes('medical')
    const isFlood = category.toLowerCase().includes('flood')
    const isWarning = !isMedical && !isFlood

    return (
        <div className="relative shrink-0 size-12 rounded-full bg-muted flex items-center justify-center">
            <div
                className="absolute inset-0 rounded-full flex items-center justify-center m-1 shadow-sm"
                style={{ backgroundColor: color }}
            />
            <div className="relative z-10 text-white flex items-center justify-center">
                {isMedical && <HeartPulse className="size-5.5" />}
                {isWarning && <TriangleAlert className="size-5.5" fill="white" />}
                {isFlood && <Waves className="size-5.5" />}
            </div>
        </div>
    )
}

function colorForFlag(category: string): string {
    if (category.toLowerCase().includes('medical')) return '#DC2626'
    if (category.toLowerCase().includes('flood')) return '#30A2F3'
    return '#FEBD09'
}

const SEARCH_CATEGORIES = [
    { value: 'users', label: 'Users', route: '/access-control' },
    { value: 'messages', label: 'Messages', route: '/ai-reports' },
    { value: 'reports', label: 'Reports', route: '/ai-reports' },
    { value: 'residents', label: 'Residents', route: '/management' },
    { value: 'hubs', label: 'Hubs', route: '/management' },
    { value: 'coordinators', label: 'Coordinators', route: '/management' },
] as const

const URGENT_FLAG_CATEGORIES = [
    { value: 'all', label: 'All Categories' },
    { value: 'fire', label: 'Fire' },
    { value: 'medical', label: 'Medical' },
    { value: 'flood', label: 'Flood' },
    { value: 'blocked_road', label: 'Blocked Road' },
    { value: 'fallen_tree', label: 'Fallen Tree' },
] as const

function Dashboard() {
    const navigate = useNavigate()
    const [searchCategory, setSearchCategory] = useState('users')
    const [searchTerm, setSearchTerm] = useState('')
    const [urgentFlagCategory, setUrgentFlagCategory] = useState<string>('all')
    const [urgentFlagPage, setUrgentFlagPage] = useState(1)

    const handleCategoryChange = (val: string) => {
        setUrgentFlagCategory(val)
        setUrgentFlagPage(1)
    }

    const handleGlobalSearch = (term: string) => {
        const trimmed = term.trim()
        if (!trimmed) return
        const category = SEARCH_CATEGORIES.find((c) => c.value === searchCategory)
        if (!category) return
        navigate({ to: category.route, search: { search: trimmed } })
    }

    const { data: overviewData, isLoading: isOverviewLoading } = useAdminOverview()
    const checkinData = overviewData?.checkinData || []
    const hazardData = overviewData?.hazardData || []
    const workloadData = overviewData?.workloadData || []
    const statCards = overviewData?.statCards || []

    const { data: urgentFlagsData, isLoading: isUrgentFlagsLoading } = useUrgentFlagsList(urgentFlagCategory === 'all' ? undefined : urgentFlagCategory, urgentFlagPage)
    const urgentFlags = urgentFlagsData?.data?.results || []
    const urgentFlagsCount = urgentFlagsData?.data?.count || 0
    const hasNextPage = !!urgentFlagsData?.data?.next
    const hasPrevPage = !!urgentFlagsData?.data?.previous
    const { data: mapData, isError: isMapError } = useDashboardMap()
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
            <PageHeader
                title="Dashboard"
                description="System status overview"
                lastUpdated={currentTime}
                searchValue={searchTerm}
                onSearchChange={(val) => {
                    setSearchTerm(val)
                }}
                searchPlaceholder={(() => {
                    const cat = SEARCH_CATEGORIES.find((c) => c.value === searchCategory)
                    return cat ? `Search ${cat.label.toLowerCase()}...` : 'Search...'
                })()}
                searchPrefix={
                    <div className="flex items-center">
                        <Select value={searchCategory} onValueChange={setSearchCategory}>
                            <SelectTrigger className="h-7 border-0 bg-transparent shadow-none rounded-full px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground gap-1 focus:ring-0 min-w-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border shadow-md min-w-[160px]">
                                {SEARCH_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value} className="text-xs font-medium">
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="h-5 w-px bg-border mx-0.5" />
                    </div>
                }
                onSearchKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleGlobalSearch(searchTerm)
                    }
                }}
            />
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
                    return <StatCard key={card.label} {...(card as any)} icon={IconComponent} isLoading={isOverviewLoading} />
                })}
            </div>

            {/* Map + Urgent Flags row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full">
                <Card
                    className="lg:col-span-7 xl:col-span-8 overflow-hidden relative cursor-pointer min-h-[300px] lg:min-h-[400px] group p-0"
                    onClick={() => navigate({ to: '/map' })}
                >
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <Suspense fallback={<Skeleton className="w-full h-full" />}>
                            {isMapError ? (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-sm">
                                    Map data unavailable
                                </div>
                            ) : (
                                <MapboxLiveMap
                                    className="w-full h-full rounded-none"
                                    showControls={false}
                                    showFilters={false}
                                    showLegend={false}
                                    interactive={false}
                                    markers={mapData?.markers || []}
                                    autoLocate={false}
                                    defaultShowUserLocation={false}
                                    center={[-77.2975, 18.1096]}
                                    zoom={8}
                                />
                            )}
                        </Suspense>
                    </div>
                    <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-6 pointer-events-none">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col justify-start bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded-lg shadow-sm pointer-events-auto transition-transform hover:scale-[1.02]">
                                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500 mb-0.5">Live Map</p>
                                <h3 className="text-sm font-bold text-slate-900 leading-none">Region overview</h3>
                            </div>
                            <div className="rounded-full bg-white/90 backdrop-blur-sm shadow-sm p-1.5 text-slate-600 pointer-events-auto transition-transform hover:scale-110">
                                <MapPin className="size-3" />
                            </div>
                        </div>
                        <div className="mt-auto self-center bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-sm flex items-center gap-2 pointer-events-auto opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <span className="text-sm font-medium text-slate-700">Tap to open interactive map</span>
                        </div>
                    </div>
                </Card>

                {/* Urgent Flags */}
                <Card className="lg:col-span-5 xl:col-span-4 p-5 md:p-6 flex flex-col h-[400px]">
                    <CardHeader className="px-0 pt-0 pb-2 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-[22px] font-bold">Urgent Flags</CardTitle>
                            <Select value={urgentFlagCategory} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="h-7 border-slate-200 bg-white rounded-full px-3 text-xs font-semibold text-slate-700 focus:ring-0 min-w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border shadow-md">
                                    {URGENT_FLAG_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value} className="text-xs font-medium">
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <span className="bg-rose-100/80 text-rose-600 text-[13px] font-bold px-4 py-1.5 rounded-full">
                            {urgentFlagsCount} Active
                        </span>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col gap-6 flex-1 overflow-y-auto pr-2">
                        {isUrgentFlagsLoading ? (
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
                            urgentFlags.map((flag: UrgentFlagResult) => (
                                <div
                                    key={flag.id}
                                    className="flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 p-2 -mx-2 rounded-xl transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <FlagIcon category={flag.category} color={colorForFlag(flag.category)} />
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <p className="text-slate-900 text-[16px] font-bold group-hover:text-blue-700 transition-colors">
                                                {flag.category_label}
                                            </p>
                                            <p
                                                className="text-muted-foreground text-[13px] font-medium leading-tight max-w-40 truncate"
                                                title={flag.description || 'Active incident'}
                                            >
                                                {flag.description || 'Active incident'}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-[13px] font-semibold shrink-0 ml-2">
                                        {new Date(flag.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="w-full py-10 flex items-center justify-center text-muted-foreground">No urgent flags.</div>
                        )}
                    </CardContent>
                    
                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4 mt-auto border-t border-slate-100">
                        <span className="text-xs text-muted-foreground font-medium">Page {urgentFlagPage}</span>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 px-2" 
                                disabled={!hasPrevPage || isUrgentFlagsLoading}
                                onClick={() => setUrgentFlagPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 px-2" 
                                disabled={!hasNextPage || isUrgentFlagsLoading}
                                onClick={() => setUrgentFlagPage(p => p + 1)}
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 h-auto lg:h-110">
                {/* Check-ins trend */}
                <Card className="xl:col-span-12 p-5 md:p-6 flex flex-col min-h-[300px] lg:min-h-0">
                    <CardHeader className="px-0 pt-0 pb-2">
                        <CardTitle className="text-[22px] font-bold">Residents Check-ins Trend</CardTitle>
                        <p className="text-muted-foreground text-[15px] font-medium">Network-wide check-in volume over the last 6 hours</p>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-[300px] lg:min-h-0 w-full relative">
                        {isOverviewLoading ? (
                            <div className="w-full h-full p-4 flex flex-col gap-4">
                                <Skeleton className="h-[250px] w-full" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={checkinData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="checkinGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={12}
                                    />
                                    <YAxis
                                        tick={{ fill: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}
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
                                        stroke="var(--primary)"
                                        strokeWidth={3}
                                        fill="url(#checkinGradient)"
                                        dot={false}
                                        activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'white', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-auto lg:h-120">
                {/* Hazard Types */}
                <Card className="lg:col-span-7 p-5 md:p-6 flex flex-col">
                    <CardHeader className="px-0 pt-0 pb-2">
                        <CardTitle className="text-[22px] font-bold">Hazard Types</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-[300px] lg:min-h-0 w-full relative">
                        {isOverviewLoading ? (
                            <div className="w-full h-full p-4 flex flex-col gap-6 justify-center">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-4 w-20 shrink-0" />
                                        <Skeleton className="h-6 w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart
                                    data={hazardData}
                                    layout="vertical"
                                    margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                                    barSize={32}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                                    <XAxis
                                        type="number"
                                        tick={{ fill: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}
                                        axisLine={false}
                                        tickLine={false}
                                        ticks={[0, 30, 60, 90, 120]}
                                        dx={10}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fill: 'var(--foreground)', fontSize: 14, fontWeight: 600 }}
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
                                            <Cell key={i} fill="var(--primary)" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* System Workload */}
                <Card className="lg:col-span-5 p-5 md:p-6 flex flex-col">
                    <CardHeader className="px-0 pt-0 pb-4">
                        <CardTitle className="text-[22px] font-bold">System Workload</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-[300px] lg:min-h-0 flex items-center justify-center w-full relative">
                        {isOverviewLoading ? (
                            <Skeleton className="size-[250px] rounded-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={workloadData}
                                        cx="50%"
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
