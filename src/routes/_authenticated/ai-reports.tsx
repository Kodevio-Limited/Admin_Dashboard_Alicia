import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
// unused tanstack query imports removed
import { Eye, Download, X, Bot, MessageSquare, BarChart2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/sections/page-header'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table'
import { cn } from '@/lib/utils'


import {
    useMessageReviews,
    useMessageReviewDetail,
    useUpdateMessageReviewStatus,
    useReportHistory,
    useReportingConfig,
    useUpdateReportingConfig,
    useDeleteReport,
    useControlConfig,
    useUpdateControlConfig,
    useGenerateReport,
} from '@/hooks/use-ai-reports'
import type { MessageReviewRow, ReportHistoryItem } from '@/lib/ai-reports'

export const Route = createFileRoute('/_authenticated/ai-reports')({
    component: AiReportsPage,
})

function MessageReviewTab() {
    const [statusFilter, setStatusFilter] = useState('all')
    const [sourceFilter, setSourceFilter] = useState('all')
    const [severityFilter, setSeverityFilter] = useState('all')
    const [viewingMessage, setViewingMessage] = useState<MessageReviewRow | null>(null)
    const statusOptions = ['all', 'pending', 'escalated', 'resolved', 'reviewed']

    const queryParams = {
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(sourceFilter !== 'all' && { source: sourceFilter }),
        ...(severityFilter !== 'all' && { severity: Number(severityFilter) }),
    }

    const { data: page, isLoading } = useMessageReviews(queryParams)

    const reviews = page?.results ?? []
    const totalCount = page?.count ?? 0

    const { data: detailsData, isLoading: isLoadingDetails } = useMessageReviewDetail(viewingMessage?.source, viewingMessage?.id)

    const updateStatusHook = useUpdateMessageReviewStatus()
    const updateStatusMutation = {
        isPending: updateStatusHook.isPending,
        mutate: (variables: { source: 'hazard' | 'checkin'; id: number; status: string }) =>
            updateStatusHook.mutate(variables as any, {
                onSuccess: (_, v) => {
                    toast.success(`Message marked as ${v.status}`)
                    setViewingMessage(null)
                },
                onError: (err: any) => {
                    toast.error(err.message || 'Failed to update message status')
                },
            }),
    }

    const columns: DataTableColumn<MessageReviewRow>[] = useMemo(
        () => [
            {
                key: 'source',
                header: 'SOURCE',
                className: 'py-2 px-2',
                headerClassName: 'px-2',
                render: (row: MessageReviewRow) => (
                    <Badge
                        variant={row.source === 'hazard' ? 'destructive' : 'secondary'}
                        className="rounded-full px-3 py-1 text-xs font-semibold capitalize"
                    >
                        {row.source}
                    </Badge>
                ),
            },
            {
                key: 'preview',
                header: 'MESSAGE',
                className: 'py-2 px-2 font-medium text-sm',
                headerClassName: 'px-2',
                render: (row: MessageReviewRow) => (
                    <div className="max-w-[360px] leading-snug truncate" title={row.preview}>
                        {row.preview}
                    </div>
                ),
            },
            {
                key: 'resident',
                header: 'REPORTER',
                className: 'py-2 text-muted-foreground text-left pr-4',
                headerClassName: 'text-left pr-4',
                render: (row: MessageReviewRow) => row.resident,
            },
            {
                key: 'severity',
                header: 'SEVERITY',
                className: 'py-2 text-left pr-4',
                headerClassName: 'text-left pr-4',
                render: (row: MessageReviewRow) => {
                    if (row.severity == null) return <span className="text-muted-foreground text-xs">—</span>
                    const colors: Record<number, string> = {
                        1: 'bg-yellow-100 text-yellow-700',
                        2: 'bg-orange-100 text-orange-700',
                        3: 'bg-red-100 text-red-700',
                    }
                    const labels: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' }
                    return (
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', colors[row.severity] ?? 'bg-muted text-muted-foreground')}>
                            {labels[row.severity] ?? `L${row.severity}`}
                        </span>
                    )
                },
            },
            {
                key: 'status',
                header: 'STATUS',
                className: 'py-2 text-left pr-4',
                headerClassName: 'text-left pr-4',
                render: (row: MessageReviewRow) => {
                    const variantMap: Record<string, string> = {
                        reviewed: 'success',
                        resolved: 'success',
                        pending: 'warning',
                        escalated: 'destructive',
                    }
                    return (
                        <Badge variant={(variantMap[row.status] ?? 'secondary') as any} className="rounded-full px-3 py-1 text-xs font-semibold capitalize">
                            {row.status}
                        </Badge>
                    )
                },
            },
            {
                key: 'time',
                header: 'TIME',
                className: 'py-2 text-left pr-4 text-muted-foreground text-sm',
                headerClassName: 'text-left pr-4',
                render: (row: MessageReviewRow) => row.time,
            },
            {
                key: 'action',
                header: 'ACTION',
                className: 'py-2 text-left pr-4',
                headerClassName: 'text-left pr-4',
                render: (row: MessageReviewRow) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Eye className="size-4" />
                                Action
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8}>
                            <DropdownMenuItem onSelect={() => setViewingMessage(row)}>View details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={() => updateStatusMutation.mutate({ source: row.source, id: row.id, status: 'resolved' })}
                            >
                                Mark as resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => updateStatusMutation.mutate({ source: row.source, id: row.id, status: 'escalated' })}
                                className="text-destructive focus:text-destructive"
                            >
                                Escalate
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [updateStatusMutation],
    )

    return (
        <div className="flex-1 flex flex-col gap-4 min-h-0 w-full">
            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Status pill filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {statusOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => setStatusFilter(option)}
                            className={cn(
                                'px-5 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap capitalize',
                                statusFilter === option
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-white text-muted-foreground border-border hover:bg-muted',
                            )}
                        >
                            {option === 'all' ? 'All' : option}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    {/* Source filter */}
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger className="w-[130px] bg-white border border-border rounded-xl h-9 text-sm font-medium shadow-none">
                            <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            <SelectItem value="checkin">Check-in</SelectItem>
                            <SelectItem value="hazard">Hazard</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Severity filter */}
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                        <SelectTrigger className="w-[140px] bg-white border border-border rounded-xl h-9 text-sm font-medium shadow-none">
                            <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Severities</SelectItem>
                            <SelectItem value="1">Low (1)</SelectItem>
                            <SelectItem value="2">Medium (2)</SelectItem>
                            <SelectItem value="3">High (3)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Count badge */}
            {!isLoading && (
                <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{reviews.length}</span> of <span className="font-semibold text-foreground">{totalCount}</span> items
                </p>
            )}

            <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-0">
                <CardContent className="p-4 flex-1 flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading message reviews...</div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-4">
                            <DataTable columns={columns} data={reviews} noun="messages" emptyIcon={<Eye className="h-6 w-6" />} />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail modal */}
            <Dialog open={!!viewingMessage} onOpenChange={(open) => !open && setViewingMessage(null)}>
                <DialogContent className="max-w-[480px] p-6 sm:rounded-[32px] gap-6 outline-none" showCloseButton={false}>
                    <div className="absolute top-4 right-4">
                        <Button variant="ghost" size="icon" onClick={() => setViewingMessage(null)}>
                            <X className="size-4" />
                        </Button>
                    </div>

                    <DialogHeader className="flex flex-col items-center gap-1.5 pt-2">
                        <DialogTitle className="text-2xl font-bold tracking-tight">Review Message</DialogTitle>
                        <p className="text-sm font-medium text-muted-foreground">{viewingMessage?.resident}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                className={cn(
                                    'rounded-md px-2 py-0.5 border-0 uppercase font-semibold text-[11px] tracking-wider',
                                    viewingMessage?.status === 'reviewed' || viewingMessage?.status === 'resolved'
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                                        : viewingMessage?.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                                          : 'bg-red-100 text-red-700 hover:bg-red-100',
                                )}
                            >
                                {viewingMessage?.status}
                            </Badge>
                            <Badge variant={viewingMessage?.source === 'hazard' ? 'destructive' : 'secondary'} className="rounded-md px-2 py-0.5 border-0 text-[11px] font-semibold uppercase">
                                {viewingMessage?.source}
                            </Badge>
                        </div>
                    </DialogHeader>

                    <div className="flex flex-col gap-5">
                        {/* Photo */}
                        {(viewingMessage?.photo_url || detailsData?.photo_url) && (
                            <div className="rounded-xl overflow-hidden bg-muted aspect-video">
                                <img
                                    src={`${(viewingMessage?.photo_url || detailsData?.photo_url)?.startsWith('http') ? '' : 'http://spark.kodevio.com:8000'}${viewingMessage?.photo_url || detailsData?.photo_url}`}
                                    alt="Report photo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Message */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[13px] font-medium text-muted-foreground">Message</span>
                            <div className="rounded-xl bg-muted p-4 text-[15px] leading-relaxed font-medium text-foreground">
                                {viewingMessage?.preview}
                            </div>
                        </div>

                        {/* Meta grid */}
                        {isLoadingDetails ? (
                            <div className="rounded-2xl bg-muted p-5 flex items-center justify-center text-sm text-muted-foreground min-h-[80px]">
                                Loading details...
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-muted p-5 flex flex-col gap-3 text-[13px]">
                                {(detailsData?.hazardType || viewingMessage?.hazardType) && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Hazard Type</span>
                                        <span className="font-semibold capitalize">{detailsData?.hazardType || viewingMessage?.hazardType}</span>
                                    </div>
                                )}
                                {(detailsData?.hub_name || viewingMessage?.hub_name) && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Hub</span>
                                        <span className="font-semibold">{detailsData?.hub_name || viewingMessage?.hub_name}</span>
                                    </div>
                                )}
                                {(detailsData?.severity ?? viewingMessage?.severity) != null && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Severity</span>
                                        <span className="font-semibold">{detailsData?.severity ?? viewingMessage?.severity} / 3</span>
                                    </div>
                                )}
                                {(detailsData?.risk_score ?? viewingMessage?.risk_score) != null && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Risk Score</span>
                                        <span className="font-semibold">{detailsData?.risk_score ?? viewingMessage?.risk_score}</span>
                                    </div>
                                )}
                                {(detailsData?.latitude ?? viewingMessage?.latitude) != null && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Coordinates</span>
                                        <span className="font-semibold font-mono text-xs">
                                            {(detailsData?.latitude ?? viewingMessage?.latitude)?.toFixed(5)}, {(detailsData?.longitude ?? viewingMessage?.longitude)?.toFixed(5)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Reported at</span>
                                    <span className="font-semibold">{viewingMessage?.time}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 mt-2">
                        <Button
                            variant="default"
                            className="w-full"
                            disabled={updateStatusMutation.isPending}
                            onClick={() => {
                                if (viewingMessage) {
                                    updateStatusMutation.mutate({ source: viewingMessage.source, id: viewingMessage.id, status: 'reviewed' })
                                }
                            }}
                        >
                            Mark as Reviewed
                        </Button>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                disabled={updateStatusMutation.isPending}
                                onClick={() => {
                                    if (viewingMessage) {
                                        updateStatusMutation.mutate({ source: viewingMessage.source, id: viewingMessage.id, status: 'resolved' })
                                    }
                                }}
                            >
                                Mark Resolved
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                disabled={updateStatusMutation.isPending}
                                onClick={() => {
                                    if (viewingMessage) {
                                        updateStatusMutation.mutate({ source: viewingMessage.source, id: viewingMessage.id, status: 'escalated' })
                                    }
                                }}
                            >
                                Escalate
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function ReportsCenterTab() {
    const { data: history = [], isLoading } = useReportHistory()
    const { data: reportingConfig } = useReportingConfig()

    const updateReportingHook = useUpdateReportingConfig()
    const updateReportingMutation = {
        isPending: updateReportingHook.isPending,
        mutate: (variables: any) =>
            updateReportingHook.mutate(variables, {
                onSuccess: () => toast.success('Auto-reporting configuration updated'),
                onError: (err: any) => toast.error(err.message || 'Failed to update auto-reporting configuration'),
            }),
    }

    const deleteReportHook = useDeleteReport()
    const deleteReportMutation = {
        isPending: deleteReportHook.isPending,
        mutate: (id: number) =>
            deleteReportHook.mutate(id, {
                onSuccess: () => toast.success('Report deleted successfully'),
                onError: (err: any) => toast.error(err.message || 'Failed to delete report'),
            }),
    }

    const [autoReporting, setAutoReporting] = useState(true)
    const [freqMinutes, setFreqMinutes] = useState(60)
    const [incActivity, setIncActivity] = useState(true)
    const [incHubs, setIncHubs] = useState(true)
    const [incAlerts, setIncAlerts] = useState(true)
    const [incPerformance, setIncPerformance] = useState(true)
    const [useAiSummary, setUseAiSummary] = useState(true)

    useEffect(() => {
        if (reportingConfig) {
            setAutoReporting(reportingConfig.auto_reporting_enabled)
            setFreqMinutes(reportingConfig.frequency_interval_minutes ?? 10080)
            setIncActivity(reportingConfig.include_activity_summary)
            setIncHubs(reportingConfig.include_hubs_summary)
            setIncAlerts(reportingConfig.include_alerts_summary)
            setIncPerformance(reportingConfig.include_ai_performance)
            setUseAiSummary(reportingConfig.use_ai_summary ?? true)
        }
    }, [reportingConfig])

    const columns: DataTableColumn<ReportHistoryItem>[] = useMemo(
        () => [
            {
                key: 'info',
                header: '',
                className: 'py-4',
                headerClassName: 'hidden',
                render: (row: ReportHistoryItem) => {
                    const date = row.created_at ? new Date(row.created_at) : null
                    const dateStr = date
                        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—'
                    // Strip markdown, take first 120 chars as preview
                    const preview = row.summary.replace(/[#*_`>\-]/g, '').trim().slice(0, 120) + (row.summary.length > 120 ? '…' : '')

                    return (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground text-[14px]">
                                    Situation Report #{row.id}
                                </span>
                                <span
                                    className={cn(
                                        'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                                        row.is_auto
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-violet-100 text-violet-700',
                                    )}
                                >
                                    {row.is_auto ? 'Auto' : 'Manual'}
                                </span>
                            </div>
                            <p className="text-[12px] text-muted-foreground leading-snug line-clamp-2">{preview}</p>
                            <span className="text-[11px] text-muted-foreground/70">{dateStr}</span>
                        </div>
                    )
                },
            },
            {
                key: 'action',
                header: '',
                className: 'py-4 text-right',
                headerClassName: 'hidden',
                render: (row: ReportHistoryItem) => (
                    <div className="flex items-center justify-end gap-2">
                        {row.pdf_url ? (
                            <a href={row.pdf_url} target="_blank" rel="noreferrer">
                                <Button variant="secondary" size="sm" className="gap-1.5">
                                    <Download className="h-3.5 w-3.5" />
                                    PDF
                                </Button>
                            </a>
                        ) : (
                            <Button variant="secondary" size="sm" className="gap-1.5 opacity-40" disabled>
                                <Download className="h-3.5 w-3.5" />
                                PDF
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            disabled={deleteReportMutation.isPending}
                            onClick={() => deleteReportMutation.mutate(row.id)}
                        >
                            Delete
                        </Button>
                    </div>
                ),
            },
        ],
        [deleteReportMutation],
    )


    const formatMinutes = (mins: number): string => {
        if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''}`
        const hours = Math.floor(mins / 60)
        const remainingMins = mins % 60
        if (hours < 24) return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours} hour${hours !== 1 ? 's' : ''}`
        const days = Math.floor(hours / 24)
        const remainingHours = hours % 24
        if (days < 7) return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} day${days !== 1 ? 's' : ''}`
        const weeks = Math.floor(days / 7)
        const remainingDays = days % 7
        return remainingDays > 0 ? `${weeks}w ${remainingDays}d` : `${weeks} week${weeks !== 1 ? 's' : ''}`
    }

    const contentSections: { id: string; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }[] = [
        { id: 'activity', label: 'Activity Summary', desc: 'Check-ins and resident activity events', checked: incActivity, onChange: (v) => { setIncActivity(v); updateReportingMutation.mutate({ include_activity_summary: v }) } },
        { id: 'hubs', label: 'Hubs Summary', desc: 'Hub status, uptime, and connectivity', checked: incHubs, onChange: (v) => { setIncHubs(v); updateReportingMutation.mutate({ include_hubs_summary: v }) } },
        { id: 'alerts', label: 'Alerts Summary', desc: 'Flagged events and hazard reports', checked: incAlerts, onChange: (v) => { setIncAlerts(v); updateReportingMutation.mutate({ include_alerts_summary: v }) } },
        { id: 'performance', label: 'AI Performance', desc: 'Confidence scores and classification accuracy', checked: incPerformance, onChange: (v) => { setIncPerformance(v); updateReportingMutation.mutate({ include_ai_performance: v }) } },
        { id: 'ai-summary', label: 'AI Summary', desc: 'GPT-generated narrative overview of the report', checked: useAiSummary, onChange: (v) => { setUseAiSummary(v); updateReportingMutation.mutate({ use_ai_summary: v }) } },
    ]

    return (
        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 w-full overflow-y-auto md:overflow-hidden pb-6 md:pb-0">
            <Card className="flex-[4] rounded-[20px] bg-white shadow-sm flex flex-col h-max md:h-full md:overflow-y-auto border-0 overflow-hidden">
                <div className="flex items-center gap-4">
                    <div className="flex-1 bg-secondary rounded-xl p-5 flex flex-col gap-1.5">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">GENERATED</span>
                        <span className="text-[32px] leading-none font-bold text-foreground mt-1">{history.length}</span>
                    </div>
                    <div className="flex-1 px-6 py-5 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Interval</span>
                        <span className="text-[22px] leading-none font-bold text-foreground mt-1.5 tracking-tight">
                            {formatMinutes(freqMinutes)}
                        </span>
                    </div>
                </div>

                {/* Auto Reporting toggle */}
                <div className="px-6 py-5 flex items-center justify-between border-t border-border/60">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[15px] font-semibold text-foreground">Auto Reporting</span>
                        <span className="text-[12px] text-muted-foreground">
                            {autoReporting ? 'Reports generate automatically' : 'Manual generation only'}
                        </span>
                    </div>
                    <Switch
                        checked={autoReporting}
                        onCheckedChange={(checked) => {
                            setAutoReporting(checked)
                            updateReportingMutation.mutate({ auto_reporting_enabled: checked })
                        }}
                        className="data-[state=checked]:bg-primary scale-110 origin-right"
                    />
                </div>

                {/* Frequency */}
                <div className="px-6 py-5 flex flex-col gap-3 border-t border-border/60">
                    <div className="flex items-center justify-between">
                        <span className="text-[15px] font-semibold text-foreground">Report Frequency</span>
                        <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                            {formatMinutes(freqMinutes)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <input
                                type="number"
                                min={1}
                                step={1}
                                value={freqMinutes}
                                onChange={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value, 10) || 1)
                                    setFreqMinutes(val)
                                }}
                                onBlur={(e) => {
                                    const val = Math.max(1, parseInt(e.target.value, 10) || 1)
                                    setFreqMinutes(val)
                                    updateReportingMutation.mutate({ frequency_interval_minutes: val })
                                }}
                                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                                className="w-full h-11 rounded-xl bg-muted border border-border/50 px-4 pr-10 text-[14px] font-semibold outline-none focus:ring-2 focus:ring-primary/20 text-center"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground font-medium pointer-events-none">min</span>
                        </div>
                        <Select
                            value=""
                            onValueChange={(val) => {
                                const mins = Number(val)
                                setFreqMinutes(mins)
                                updateReportingMutation.mutate({ frequency_interval_minutes: mins })
                            }}
                        >
                            <SelectTrigger className="w-fit min-w-[120px] bg-muted border border-border/50 rounded-xl h-11 text-[13px] font-medium shadow-none">
                                <SelectValue placeholder="Quick pick" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 min</SelectItem>
                                <SelectItem value="10">10 min</SelectItem>
                                <SelectItem value="15">15 min</SelectItem>
                                <SelectItem value="30">30 min</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="180">3 hours</SelectItem>
                                <SelectItem value="360">6 hours</SelectItem>
                                <SelectItem value="720">12 hours</SelectItem>
                                <SelectItem value="1440">Daily</SelectItem>
                                <SelectItem value="10080">Weekly</SelectItem>
                                <SelectItem value="43200">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Report Contents */}
                <div className="px-6 pb-6 flex flex-col border-t border-border/60">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-5 pb-3">Report Contents</span>
                    <div className="flex flex-col divide-y divide-border/50">
                        {contentSections.map((section) => (
                            <div key={section.id} className="flex items-center justify-between py-3.5">
                                <div className="flex flex-col gap-0.5">
                                    <label htmlFor={section.id} className="text-[14px] font-semibold text-foreground cursor-pointer leading-none">
                                        {section.label}
                                    </label>
                                    <span className="text-[11px] text-muted-foreground">{section.desc}</span>
                                </div>
                                <Switch
                                    id={section.id}
                                    checked={section.checked}
                                    onCheckedChange={section.onChange}
                                    className="data-[state=checked]:bg-primary scale-90 origin-right"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <Card className="flex-[6] rounded-[20px] bg-white p-6 md:p-8 shadow-sm flex flex-col min-h-0 border-0 h-[600px] md:h-full">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Report History</h2>
                <div className="flex-1 flex flex-col min-h-0">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading history...</div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            <div className="flex-1 overflow-y-auto pr-2">
                                <DataTable columns={columns} data={history} noun="reports" />
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

function AiReportsPage() {
    const [activeTab, setActiveTab] = useState('ai-control')
    const { data: controlConfig } = useControlConfig()

    const updateControlHook = useUpdateControlConfig()
    const updateControlMutation = {
        isPending: updateControlHook.isPending,
        mutate: (variables: any) =>
            updateControlHook.mutate(variables, {
                onSuccess: () => toast.success('AI Control configuration updated'),
                onError: (err: any) => toast.error(err.message || 'Failed to update AI Control configuration'),
            }),
    }

    const generateReportHook = useGenerateReport()
    const generateReportMutation = {
        isPending: generateReportHook.isPending,
        mutate: () =>
            generateReportHook.mutate(undefined, {
                onSuccess: () => toast.success('Manual report generation triggered successfully!'),
                onError: (err: any) => toast.error(err.message || 'Failed to trigger report generation'),
            }),
    }

    const [confidence, setConfidence] = useState(85)
    const [autoClassification, setAutoClassification] = useState(true)
    const [controlFreqVal, setControlFreqVal] = useState(60)
    const [controlFreqUnit, setControlFreqUnit] = useState('min')
    const [controlLastUpdated, setControlLastUpdated] = useState<string | undefined>(undefined)

    const handleControlFreqChange = (newVal: number, newUnit: string) => {
        setControlFreqVal(newVal)
        setControlFreqUnit(newUnit)
        
        let str = `${newVal}${newUnit}`
        if (newUnit === 'days') {
            if (newVal === 1) str = 'daily'
            else if (newVal === 7) str = 'weekly'
            else if (newVal === 30 || newVal === 31) str = 'monthly'
        }
        updateControlMutation.mutate({ review_report_frequency: str })
    }

    useEffect(() => {
        if (controlConfig) {
            setConfidence(controlConfig.confidence_threshold)
            setAutoClassification(controlConfig.autonomous_classification)
            
            const freq = controlConfig.review_report_frequency || '60min'
            let val = 60
            let unit = 'min'
            if (freq === 'daily') { val = 1; unit = 'days' }
            else if (freq === 'weekly') { val = 7; unit = 'days' }
            else if (freq === 'monthly') { val = 30; unit = 'days' }
            else {
                const match = freq.match(/^(\d+)(min|hours|days|hour)$/)
                if (match) {
                    val = parseInt(match[1], 10)
                    unit = match[2]
                    if (unit === 'hour') unit = 'hours'
                }
            }
            setControlFreqVal(val)
            setControlFreqUnit(unit)

            if (controlConfig.updated_at) {
                setControlLastUpdated(
                    new Date(controlConfig.updated_at).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    })
                )
            }
        }
    }, [controlConfig])

    return (
        <>
            <PageHeader title="AI & Reports" description="Monitor AI performance and manage automated reporting" lastUpdated={controlLastUpdated}>
                <Button
                    variant="default"
                    disabled={generateReportMutation.isPending}
                    onClick={() => generateReportMutation.mutate()}
                >
                    {generateReportMutation.isPending ? 'Generating...' : 'Generate Report'}
                </Button>
            </PageHeader>

            <div className="flex-1 flex flex-col gap-6 w-full min-h-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 w-full">
                    <div className="relative flex border-b border-border/60">
                        {([
                            { value: 'ai-control', label: 'AI Control', icon: Bot },
                            { value: 'message-review', label: 'Message Review', icon: MessageSquare },
                            { value: 'reports-center', label: 'Reports Center', icon: BarChart2 },
                        ] as const).map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setActiveTab(value)}
                                className={cn(
                                    'relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-t-sm',
                                    activeTab === value
                                        ? 'text-foreground'
                                        : 'text-muted-foreground hover:text-foreground/80',
                                )}
                            >
                                <Icon className="h-[15px] w-[15px] shrink-0" />
                                {label}
                                {activeTab === value && (
                                    <span className="absolute inset-x-0 -bottom-px h-[2px] bg-primary rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    <TabsContent value="ai-control" className="mt-6 flex flex-col gap-4 outline-none w-full flex-1">
                        <div className="rounded-2xl bg-muted border border-black/[0.03] shadow-sm p-6">
                            <div className="space-y-1">
                                <h2 className="text-[17px] font-semibold text-foreground tracking-tight">Confidence Threshold</h2>
                                <p className="text-sm text-muted-foreground">Minimum AI confidence required to auto-classify a message.</p>
                            </div>

                            <div className="mt-14 relative">
                                <div className="absolute right-0 -top-11 text-[28px] font-bold text-primary tracking-tight">
                                    {confidence}%
                                </div>
                                <input
                                    type="range"
                                    min={50}
                                    max={99}
                                    value={confidence}
                                    onChange={(event) => setConfidence(Number(event.target.value))}
                                    onMouseUp={() => updateControlMutation.mutate({ confidence_threshold: confidence })}
                                    onTouchEnd={() => updateControlMutation.mutate({ confidence_threshold: confidence })}
                                    className="w-full h-2.5 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((confidence - 50) / 49) * 100}%, var(--secondary) ${((confidence - 50) / 49) * 100}%, var(--secondary) 100%)`,
                                    }}
                                />
                                <div className="flex justify-between text-[11px] text-muted-foreground mt-2.5 font-medium">
                                    <span>Passes More (50%)</span>
                                    <span>Flags More (99%)</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-muted border border-black/[0.03] shadow-sm p-6 flex items-center justify-between gap-6">
                            <div className="space-y-1 flex-1">
                                <h2 className="text-[17px] font-semibold text-foreground tracking-tight">Enable Auto-Classification</h2>
                                <p className="text-sm text-muted-foreground">
                                    If disabled, all incoming messages will require manual human review regardless of confidence score.
                                </p>
                            </div>
                            <Switch
                                checked={autoClassification}
                                onCheckedChange={(checked) => {
                                    setAutoClassification(checked)
                                    updateControlMutation.mutate({ autonomous_classification: checked })
                                }}
                                className="data-[state=checked]:bg-primary scale-125 origin-right"
                            />
                        </div>

                        <div className="rounded-2xl bg-muted border border-black/[0.03] shadow-sm p-6 flex items-center justify-between gap-6">
                            <div className="space-y-1 flex-1">
                                <h2 className="text-[17px] font-semibold text-foreground tracking-tight">Report Frequency</h2>
                                <p className="text-sm text-muted-foreground">
                                    Select how often automated performance reports are generated.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={controlFreqVal}
                                    onChange={(e) => setControlFreqVal(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                    onBlur={(e) => {
                                        const val = Math.max(1, parseInt(e.target.value, 10) || 1)
                                        handleControlFreqChange(val, controlFreqUnit)
                                    }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                                    className="w-20 h-10 rounded-xl bg-background border border-border px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 text-center"
                                />
                                <Select
                                    value={controlFreqUnit}
                                    onValueChange={(val) => handleControlFreqChange(controlFreqVal, val)}
                                >
                                    <SelectTrigger className="w-[110px] bg-background border border-border rounded-xl h-10 shadow-sm text-sm font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="min">Minutes</SelectItem>
                                        <SelectItem value="hours">Hours</SelectItem>
                                        <SelectItem value="days">Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="message-review" className="mt-6 outline-none flex-1 data-[state=active]:flex flex-col min-h-0">
                        <MessageReviewTab />
                    </TabsContent>

                    <TabsContent value="reports-center" className="mt-6 outline-none flex-1 data-[state=active]:flex flex-col min-h-0">
                        <ReportsCenterTab />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}
