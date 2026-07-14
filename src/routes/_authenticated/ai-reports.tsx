import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
// unused tanstack query imports removed
import { Eye, Download, X, Bot, MessageSquare, BarChart2, Search, SlidersHorizontal, Edit, Loader2, Save, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { PageHeader } from '@/components/sections/page-header'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table'
import { ServerDataTable } from '@/components/shared/server-data-table'
import { cn } from '@/lib/utils'


import { useQueryErrorToast } from '@/hooks/use-query-error-toast'
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
    useUpdateReport,
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

    const { data: page, isLoading, isError: isReviewsError, error: reviewsError } = useMessageReviews(queryParams)

    const reviews = page?.results ?? []
    const totalCount = page?.count ?? 0

    // ─── Toasts for data fetch failures ────────────────────────────────────
    useQueryErrorToast({ key: 'message-reviews', label: 'Message reviews', isError: isReviewsError, error: reviewsError })

    const { data: detailsData, isLoading: isLoadingDetails, isError: isDetailError, error: detailError } = useMessageReviewDetail(viewingMessage?.source, viewingMessage?.id)
    useQueryErrorToast({ key: 'message-detail', label: 'Message details', isError: isDetailError, error: detailError })

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

/* ===================================================================
   ConfigPanel — reusable wrapper for AI Control & Reporting config.
   No dimming. Controls always visible. Edit toggles interactive state.
   =================================================================== */
function ConfigPanel({
    title,
    description,
    icon: Icon,
    onSave,
    onCancel,
    isPending,
    isLoading,
    children,
}: {
    title: string
    description: string
    icon: React.ElementType
    onSave: () => Promise<void>
    onCancel: () => void
    isPending: boolean
    isLoading?: boolean
    children: React.ReactNode
}) {
    const [isEditing, setIsEditing] = useState(false)

    if (isLoading) {
        return (
            <Card className="rounded-2xl shadow-sm border border-black/[0.04] bg-white overflow-hidden">
                <CardHeader className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-xl shrink-0" />
                        <div className="flex flex-col gap-2 min-w-0 flex-1">
                            <Skeleton className="h-5 w-48 rounded-md" />
                            <Skeleton className="h-4 w-72 rounded-md" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-5 space-y-6">
                    <Skeleton className="h-4 w-36 rounded-md" />
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="h-4 w-32 rounded-md" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="rounded-2xl shadow-sm border border-black/[0.04] bg-white flex flex-col h-full min-h-0 overflow-visible">
            <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pt-4 pb-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="text-[15px] font-bold text-foreground tracking-tight">{title}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">{description}</CardDescription>
                    </div>
                </div>
                <Button
                    variant={isEditing ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => {
                        if (isEditing) { setIsEditing(false); onCancel() }
                        else { setIsEditing(true) }
                    }}
                    className="shrink-0 rounded-lg h-8 px-3 text-xs transition-all duration-200"
                >
                    {isEditing ? <><XCircle className="size-3 mr-1" />Cancel</> : <><Edit className="size-3 mr-1" />Edit</>}
                </Button>
            </CardHeader>
            <CardContent className="px-4 py-3 flex-1 min-h-0">{children}</CardContent>
            {isEditing && (
                <CardFooter className="flex justify-end gap-2 px-4 py-3 border-t border-border/60 bg-muted/30 shrink-0">
                    <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={() => { setIsEditing(false); onCancel(); }} disabled={isPending}>
                        <XCircle className="size-3 mr-1" />Cancel
                    </Button>
                    <Button size="sm" className="rounded-lg h-8 text-xs shadow-sm" onClick={() => { onSave().then(() => setIsEditing(false)); }} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-1.5 size-3 animate-spin" /> : <Save className="size-3 mr-1" />}
                        Save
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}

/* ── helpers ─────────────────────────────────────────────────────── */
function freqMinutesToControlString(minutes: number): string {
    if (minutes === 1440) return 'daily'
    if (minutes === 10080) return 'weekly'
    if (minutes === 43200) return 'monthly'
    return `${minutes}min`
}

function controlStringToFreqMinutes(str: string): number {
    if (str === 'daily') return 1440
    if (str === 'weekly') return 10080
    if (str === 'monthly') return 43200
    const match = str.match(/^(\d+)(min|hours|days|hour)$/)
    if (match) {
        const val = parseInt(match[1], 10)
        const unit = match[2].replace('hour', 'hours')
        if (unit === 'min') return val
        if (unit === 'hours') return val * 60
        if (unit === 'days') return val * 1440
    }
    return 60
}

/* ===================================================================
   AI Control Tab — two API resource panels, single-PUT-per-config
   =================================================================== */
function AiControlTab() {
    const { data: controlConfig, isError: isControlError, error: controlError } = useControlConfig()
    const { data: reportingConfig, isError: isReportingError, error: reportingError } = useReportingConfig()

    useQueryErrorToast({ key: 'ai-control-config', label: 'AI control configuration', isError: isControlError, error: controlError })
    useQueryErrorToast({ key: 'ai-reporting-config', label: 'AI reporting configuration', isError: isReportingError, error: reportingError })

    const updateControlHook = useUpdateControlConfig()
    const updateReportingHook = useUpdateReportingConfig()

    const saveControl = async (payload: any) => {
        try {
            await updateControlHook.mutateAsync(payload)
            toast.success('Configuration updated successfully')
        } catch (err: any) {
            toast.error(err.message || 'Failed to update configuration')
            throw err
        }
    }

    const saveReporting = async (payload: any) => {
        try {
            await updateReportingHook.mutateAsync(payload)
            toast.success('Configuration updated successfully')
        } catch (err: any) {
            toast.error(err.message || 'Failed to update configuration')
            throw err
        }
    }

    const [confidence, setConfidence] = useState(85)
    const [autoClassification, setAutoClassification] = useState(true)
    const [autoReporting, setAutoReporting] = useState(true)
    const [freqMinutes, setFreqMinutes] = useState(60)

    const [incActivity, setIncActivity] = useState(true)
    const [incHubs, setIncHubs] = useState(true)
    const [incAlerts, setIncAlerts] = useState(true)
    const [incPerformance, setIncPerformance] = useState(true)
    const [useAiSummary, setUseAiSummary] = useState(true)

    const syncControl = () => {
        if (controlConfig) {
            setConfidence(controlConfig.confidence_threshold)
            setAutoClassification(controlConfig.autonomous_classification)
            setFreqMinutes(controlStringToFreqMinutes(controlConfig.review_report_frequency))
        }
    }

    const syncReporting = () => {
        if (reportingConfig) {
            setAutoReporting(reportingConfig.auto_reporting_enabled)
            setIncActivity(reportingConfig.include_activity_summary)
            setIncHubs(reportingConfig.include_hubs_summary)
            setIncAlerts(reportingConfig.include_alerts_summary)
            setIncPerformance(reportingConfig.include_ai_performance)
            setUseAiSummary(reportingConfig.use_ai_summary ?? true)
        }
    }

    useEffect(() => { syncControl() }, [controlConfig])
    useEffect(() => { syncReporting() }, [reportingConfig])

    const contentSections = [
        { id: 'activity', label: 'Activity Summary', desc: 'Check-ins and resident activity events', checked: incActivity, onChange: (v: boolean) => setIncActivity(v) },
        { id: 'hubs', label: 'Hubs Summary', desc: 'Hub status, uptime, and connectivity', checked: incHubs, onChange: (v: boolean) => setIncHubs(v) },
        { id: 'alerts', label: 'Alerts Summary', desc: 'Flagged events and hazard reports', checked: incAlerts, onChange: (v: boolean) => setIncAlerts(v) },
        { id: 'performance', label: 'AI Performance', desc: 'Confidence scores and classification accuracy', checked: incPerformance, onChange: (v: boolean) => setIncPerformance(v) },
        { id: 'ai-summary', label: 'AI Summary', desc: 'GPT-generated narrative overview of the report', checked: useAiSummary, onChange: (v: boolean) => setUseAiSummary(v) },
    ]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full flex-1 min-h-0">
            {/* ──── AI Classification ──── */}
            <ConfigPanel
                title="AI Classification"
                description="Confidence thresholds and autonomous classification behavior."
                icon={Bot}
                onCancel={syncControl}
                onSave={() =>
                    saveControl({
                        confidence_threshold: confidence,
                        autonomous_classification: autoClassification,
                        review_report_frequency: freqMinutesToControlString(freqMinutes),
                    })
                }
                isPending={updateControlHook.isPending}
            >
                <div className="flex flex-col gap-4">
                    {/* Confidence Threshold */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-[13px] font-semibold text-foreground">Confidence Threshold</h3>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Minimum AI confidence to auto-classify a message.
                                </p>
                            </div>
                            <span className="text-xl font-bold text-primary tabular-nums tracking-tight">
                                {confidence}%
                            </span>
                        </div>
                        <div className="relative pt-0.5">
                            {/* Track background (unfilled) */}
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full bg-muted/70" />
                            {/* Track fill */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 left-0 h-2 rounded-full bg-primary"
                                style={{ width: `${((confidence - 50) / 49) * 100}%` }}
                            />
                            <input
                                type="range"
                                min={50}
                                max={99}
                                value={confidence}
                                onChange={(e) => setConfidence(Number(e.target.value))}
                                aria-label="Confidence threshold"
                                aria-valuetext={`${confidence} percent`}
                                className="relative w-full h-2.5 appearance-none bg-transparent outline-none cursor-pointer z-10
                                    [&::-webkit-slider-runnable-track]:bg-transparent
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md
                                    [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                                    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
                                    [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95
                                    [&::-moz-range-track]:bg-transparent
                                    [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                                    [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
                                    [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform
                                    [&::-moz-range-thumb]:hover:scale-110"
                            />
                            <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-medium">
                                <span>50%</span>
                                <span>99%</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Auto-Classification */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-[13px] font-semibold text-foreground">Auto-Classification</h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Auto-classify messages meeting confidence threshold.
                            </p>
                        </div>
                        <Switch
                            checked={autoClassification}
                            onCheckedChange={setAutoClassification}
                            className="data-[state=checked]:bg-primary shrink-0"
                        />
                    </div>

                    <Separator />

                    {/* Report Interval */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-[13px] font-semibold text-foreground">Report Interval</h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                Minutes between auto reports.
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <div className="relative">
                                <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={freqMinutes}
                                    onChange={(e) => setFreqMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                    className="w-20 h-8 rounded-lg bg-background border border-border px-3 pr-7 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20 text-center"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium pointer-events-none">min</span>
                            </div>
                            <Select value="" onValueChange={(val) => setFreqMinutes(Number(val))}>
                                <SelectTrigger className="w-fit min-w-[90px] bg-background border border-border rounded-lg h-8 text-[11px] font-medium shadow-none px-2">
                                    <SelectValue placeholder="Pick" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 min</SelectItem>
                                    <SelectItem value="15">15 min</SelectItem>
                                    <SelectItem value="60">1 hour</SelectItem>
                                    <SelectItem value="1440">Daily</SelectItem>
                                    <SelectItem value="10080">Weekly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                </div>
            </ConfigPanel>

            {/* ──── Reporting Configuration ──── */}
            <ConfigPanel
                title="Reporting Configuration"
                description="Automated report generation, intervals, and content sections."
                icon={BarChart2}
                onCancel={syncReporting}
                onSave={() =>
                    saveReporting({
                        auto_reporting_enabled: autoReporting,
                        include_activity_summary: incActivity,
                        include_hubs_summary: incHubs,
                        include_alerts_summary: incAlerts,
                        include_ai_performance: incPerformance,
                        use_ai_summary: useAiSummary,
                    })
                }
                isPending={updateReportingHook.isPending}
            >
                <div className="flex flex-col gap-4">
                    {/* Auto Reporting */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-[13px] font-semibold text-foreground">Auto Reporting</h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                {autoReporting ? 'Automatic on schedule.' : 'Manual only.'}
                            </p>
                        </div>
                        <Switch
                            checked={autoReporting}
                            onCheckedChange={setAutoReporting}
                            className="data-[state=checked]:bg-primary shrink-0"
                        />
                    </div>

                    <Separator />

                    {/* Report Contents */}
                    <div>
                        <h3 className="text-[13px] font-semibold text-foreground mb-2">Report Contents</h3>
                        <div className="flex flex-col gap-0.5">
                            {contentSections.map((section) => (
                                <label
                                    key={section.id}
                                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                                >
                                    <Checkbox
                                        checked={section.checked}
                                        onCheckedChange={(val) => section.onChange(val === true)}
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[13px] font-medium text-foreground leading-tight">
                                            {section.label}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground truncate leading-tight">
                                            {section.desc}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </ConfigPanel>
        </div>
    )
}

function ReportsCenterTab() {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)

    const { data: reportPage, isLoading: isHistoryLoading, isError: isHistoryError, error: historyError } = useReportHistory({ page, limit })
    const history = reportPage?.results ?? []
    const totalCount = reportPage?.count ?? 0

    // ─── Toast for data fetch failures ─────────────────────────────────────
    useQueryErrorToast({ key: 'reports-history', label: 'Reports history', isError: isHistoryError, error: historyError })

    const updateReportHook = useUpdateReport()
    const deleteReportHook = useDeleteReport()

    const [editingId, setEditingId] = useState<number | null>(null)
    const [editSummary, setEditSummary] = useState('')
    const [editIsAuto, setEditIsAuto] = useState(false)

    const [searchQuery, setSearchQuery] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    const deleteReport = (id: number) =>
        deleteReportHook.mutate(id, {
            onSuccess: () => toast.success('Report deleted successfully'),
            onError: (err: any) => toast.error(err.message || 'Failed to delete report'),
        })

    const startEdit = (report: ReportHistoryItem) => {
        setEditingId(report.id)
        setEditSummary(report.summary)
        setEditIsAuto(report.is_auto)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditSummary('')
        setEditIsAuto(false)
    }

    const saveEdit = async (id: number) => {
        try {
            await updateReportHook.mutateAsync({ id, data: { summary: editSummary, is_auto: editIsAuto } })
            toast.success('Report updated successfully')
            setEditingId(null)
        } catch (err: any) {
            toast.error(err.message || 'Failed to update report')
        }
    }

    const clearFilters = () => {
        setSearchQuery('')
        setDateFrom('')
        setDateTo('')
    }

    const hasActiveFilters = !!(searchQuery || dateFrom || dateTo)

    // Client-side filter over server-fetched page
    const filteredHistory = useMemo(() => {
        if (!searchQuery && !dateFrom && !dateTo) return history
        return history.filter((report) => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase().trim()
                const idMatch = String(report.id).includes(q)
                const summaryMatch = report.summary.toLowerCase().includes(q)
                if (!idMatch && !summaryMatch) return false
            }
            if (dateFrom || dateTo) {
                const reportDate = report.created_at ? new Date(report.created_at) : null
                if (!reportDate) return false
                if (dateFrom) {
                    const from = new Date(dateFrom)
                    from.setHours(0, 0, 0, 0)
                    if (reportDate < from) return false
                }
                if (dateTo) {
                    const to = new Date(dateTo)
                    to.setHours(23, 59, 59, 999)
                    if (reportDate > to) return false
                }
            }
            return true
        })
    }, [history, searchQuery, dateFrom, dateTo])

    const columns: DataTableColumn<ReportHistoryItem>[] = useMemo(
        () => [
            {
                key: 'report',
                header: 'REPORT',
                className: 'py-2 px-2 min-w-[80px]',
                headerClassName: 'px-2',
                render: (report: ReportHistoryItem) => {
                    const isEditingThis = editingId === report.id
                    return (
                        <span className={cn(
                            'font-semibold text-foreground text-[14px]',
                            isEditingThis && 'text-primary'
                        )}>
                            #{report.id}
                        </span>
                    )
                },
            },
            {
                key: 'details',
                header: 'DETAILS',
                className: 'py-2 px-2 min-w-[200px] max-w-[360px]',
                headerClassName: 'px-2',
                render: (report: ReportHistoryItem) => {
                    const isEditingThis = editingId === report.id
                    const date = report.created_at ? new Date(report.created_at) : null
                    const dateStr = date
                        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—'

                    return (
                        <div className="flex flex-col gap-1.5 min-w-0 max-w-full">
                            <div className="flex items-center gap-2">
                                {isEditingThis ? (
                                    <button
                                        type="button"
                                        onClick={() => setEditIsAuto(!editIsAuto)}
                                        className={cn(
                                            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors',
                                            editIsAuto
                                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                : 'bg-violet-100 text-violet-700 hover:bg-violet-200',
                                        )}
                                    >
                                        {editIsAuto ? 'Auto' : 'Manual'}
                                    </button>
                                ) : (
                                    <span
                                        className={cn(
                                            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                                            report.is_auto
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-violet-100 text-violet-700',
                                        )}
                                    >
                                        {report.is_auto ? 'Auto' : 'Manual'}
                                    </span>
                                )}
                            </div>
                            {isEditingThis ? (
                                <textarea
                                    value={editSummary}
                                    onChange={(e) => setEditSummary(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-[12px] text-foreground leading-relaxed resize-none outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            ) : (
                                <p className="text-[12px] text-muted-foreground leading-snug line-clamp-2 break-words">
                                    {report.summary.replace(/[#*_`>\-]/g, '').trim().slice(0, 120)}
                                    {report.summary.length > 120 ? '…' : ''}
                                </p>
                            )}
                            <span className="text-[11px] text-muted-foreground/70">{dateStr}</span>
                        </div>
                    )
                },
            },
            {
                key: 'actions',
                header: 'ACTIONS',
                className: 'py-2 px-2 text-right whitespace-nowrap',
                headerClassName: 'px-2 text-right',
                render: (report: ReportHistoryItem) => {
                    const isEditingThis = editingId === report.id
                    if (isEditingThis) {
                        return (
                            <div className="flex items-center justify-end gap-1.5">
                                <Button variant="secondary" size="sm" className="gap-1 h-8 px-2.5" onClick={cancelEdit} disabled={updateReportHook.isPending}>
                                    <XCircle className="size-3.5" />
                                    <span className="hidden sm:inline">Cancel</span>
                                </Button>
                                <Button variant="default" size="sm" className="gap-1 h-8 px-2.5" onClick={() => saveEdit(report.id)} disabled={updateReportHook.isPending}>
                                    {updateReportHook.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                                    <span className="hidden sm:inline">Save</span>
                                </Button>
                            </div>
                        )
                    }
                    return (
                        <div className="flex items-center justify-end gap-1.5">
                            <Button variant="ghost" size="sm" className="gap-1 h-8 px-2" onClick={() => startEdit(report)}>
                                <Edit className="size-3.5" />
                                <span className="hidden sm:inline">Edit</span>
                            </Button>
                            {report.pdf_url ? (
                                <a href={report.pdf_url} target="_blank" rel="noreferrer">
                                    <Button variant="secondary" size="sm" className="gap-1 h-8 px-2.5">
                                        <Download className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">PDF</span>
                                    </Button>
                                </a>
                            ) : (
                                <Button variant="secondary" size="sm" className="gap-1 h-8 px-2.5 opacity-40" disabled>
                                    <Download className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">PDF</span>
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-8 px-2" disabled={deleteReportHook.isPending} onClick={() => deleteReport(report.id)}>
                                Delete
                            </Button>
                        </div>
                    )
                },
            },
        ],
        [editingId, editSummary, editIsAuto, updateReportHook.isPending, deleteReportHook.isPending],
    )

    return (
        <div className="flex-1 flex flex-col gap-6 w-full min-h-0">
            <Card className="flex-1 rounded-[20px] bg-white p-6 md:p-8 shadow-sm flex flex-col min-h-0 border-0">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">Report History</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by ID or summary..." className="w-full sm:w-[220px] h-9 rounded-xl bg-muted border border-border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow" />
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn('h-9 rounded-full px-4 gap-2 text-xs font-semibold border-black/5 bg-white shadow-sm hover:bg-slate-50', hasActiveFilters && 'border-primary text-primary')}>
                                    <SlidersHorizontal className="size-3.5" />
                                    Filter
                                    {hasActiveFilters && <span className="size-1.5 rounded-full bg-primary" />}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 rounded-2xl p-4 flex flex-col gap-4 border shadow-xl bg-white" align="end">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm">Filters</h3>
                                    {hasActiveFilters && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground">
                                            Clear all
                                        </Button>
                                    )}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">From Date</label>
                                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full h-10 rounded-lg bg-muted/40 border-none px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">To Date</label>
                                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full h-10 rounded-lg bg-muted/40 border-none px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <div className="bg-secondary rounded-full px-4 py-1.5 flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Generated</span>
                            <span className="text-sm font-bold text-foreground">{totalCount}</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 flex flex-col gap-4">
                        <ServerDataTable
                            columns={columns}
                            data={filteredHistory}
                            noun="reports"
                            emptyIcon={<Eye className="h-6 w-6" />}
                            onReset={hasActiveFilters ? clearFilters : undefined}
                            totalCount={totalCount}
                            page={page}
                            limit={limit}
                            onPageChange={(p) => { setPage(p); setEditingId(null) }}
                            onLimitChange={(l) => { setLimit(l); setPage(1); setEditingId(null) }}
                            isLoading={isHistoryLoading}
                        />
                    </div>
                </div>
            </Card>
        </div>
    )
}

function AiReportsPage() {
    const [activeTab, setActiveTab] = useState('ai-control')
    const { data: controlConfig } = useControlConfig()

    const generateReportHook = useGenerateReport()
    const generateReportMutation = {
        isPending: generateReportHook.isPending,
        mutate: () =>
            generateReportHook.mutate(undefined, {
                onSuccess: () => toast.success('Manual report generation triggered successfully!'),
                onError: (err: any) => toast.error(err.message || 'Failed to trigger report generation'),
            }),
    }

    const [controlLastUpdated, setControlLastUpdated] = useState<string | undefined>(undefined)

    useEffect(() => {
        if (controlConfig) {
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

                    <TabsContent value="ai-control" className="mt-6 outline-none flex-1 data-[state=active]:flex flex-col min-h-0 pb-6">
                        <AiControlTab />
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
