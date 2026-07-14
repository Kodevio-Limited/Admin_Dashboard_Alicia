import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Bot, MessageSquare, BarChart2, FileText, SlidersHorizontal } from 'lucide-react'
import { useQueryErrorToast } from '@/hooks/use-query-error-toast'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/sections/page-header'
import { cn } from '@/lib/utils'
import { useControlConfig, useGenerateReport, useReportHistory } from '@/hooks/use-ai-reports'
import { AiControlTab, MessageReviewTab, ReportsCenterTab } from '@/features/ai-reports'

export const Route = createFileRoute('/_authenticated/ai-reports')({
    component: AiReportsPage,
})

const STATUS_OPTIONS = ['all', 'pending', 'escalated', 'resolved', 'reviewed'] as const

function AiReportsPage() {
    const [activeTab, setActiveTab] = useState('ai-control')
    const { data: controlConfig } = useControlConfig()
    const generateReportHook = useGenerateReport()
    const [controlLastUpdated, setControlLastUpdated] = useState<string | undefined>(undefined)

    // ── Tab detection ──────────────────────────────────────────────
    const isAiControl = activeTab === 'ai-control'
    const isMessageReview = activeTab === 'message-review'
    const isReports = activeTab === 'reports-center'

    // ── Message Review state ───────────────────────────────────────
    const [msgSearch, setMsgSearch] = useState(
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('search') || '' : '',
    )
    const [msgStatus, setMsgStatus] = useState('all')
    const [msgSource, setMsgSource] = useState('all')
    const [msgSeverity, setMsgSeverity] = useState('all')
    const msgHasFilters = msgStatus !== 'all' || msgSource !== 'all' || msgSeverity !== 'all'
    const clearMsgFilters = () => { setMsgStatus('all'); setMsgSource('all'); setMsgSeverity('all') }

    // ── Reports Center state ───────────────────────────────────────
    const [reportPage, setReportPage] = useState(1)
    const [reportLimit, setReportLimit] = useState(10)
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [reportSearch, setReportSearch] = useState(
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('search') || '' : '',
    )

    const { data: reportHistory, isError: isReportsError, error: reportsError } = useReportHistory(
        { page: reportPage, limit: reportLimit },
        { enabled: isReports },
    )
    useQueryErrorToast({ key: 'reports-history', label: 'Reports history', isError: isReportsError, error: reportsError })
    const totalCount = reportHistory?.count ?? 0
    const reportsHasFilters = !!(reportSearch || dateFrom || dateTo)

    const clearReportsFilters = () => {
        setReportSearch('')
        setDateFrom('')
        setDateTo('')
        setReportPage(1)
    }

    // ── Tab-aware search ───────────────────────────────────────────
    const searchValue = isMessageReview ? msgSearch : isReports ? reportSearch : ''
    const onSearchChange = isMessageReview ? setMsgSearch : isReports ? setReportSearch : undefined
    const searchPlaceholder = isMessageReview
        ? 'Search messages...'
        : isReports
            ? 'Search reports by ID or summary...'
            : undefined

    useEffect(() => {
        if (controlConfig?.updated_at) {
            setControlLastUpdated(
                new Date(controlConfig.updated_at).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                }),
            )
        }
    }, [controlConfig])

    return (
        <>
            <PageHeader
                title="AI & Reports"
                description="Monitor AI performance and manage automated reporting"
                lastUpdated={controlLastUpdated}
                searchValue={searchValue}
                onSearchChange={onSearchChange}
                searchPlaceholder={searchPlaceholder}
            >
                {isAiControl && (
                    <Button
                        variant="default"
                        className="h-9 rounded-full text-xs font-semibold"
                        disabled={generateReportHook.isPending}
                        onClick={() => generateReportHook.mutate()}
                    >
                        {generateReportHook.isPending ? 'Generating...' : 'Generate Report'}
                    </Button>
                )}

                {isMessageReview && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'h-9 rounded-full px-4 gap-2 text-xs font-semibold border-black/5 bg-white shadow-sm hover:bg-slate-50',
                                    msgHasFilters && 'border-primary text-primary',
                                )}
                            >
                                <SlidersHorizontal className="size-3.5" />
                                Filter
                                {msgHasFilters && <span className="size-1.5 rounded-full bg-primary" />}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 rounded-2xl p-4 flex flex-col gap-4 border shadow-xl bg-white" align="end">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm">Filters</h3>
                                {msgHasFilters && (
                                    <Button variant="ghost" size="sm" onClick={clearMsgFilters} className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground">
                                        Clear all
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                                    <Select value={msgStatus} onValueChange={setMsgStatus}>
                                        <SelectTrigger className="h-10 rounded-lg bg-muted/40 border-none shadow-none text-sm">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-md">
                                            {STATUS_OPTIONS.map((opt) => (
                                                <SelectItem key={opt} value={opt}>
                                                    {opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Source</label>
                                    <Select value={msgSource} onValueChange={setMsgSource}>
                                        <SelectTrigger className="h-10 rounded-lg bg-muted/40 border-none shadow-none text-sm">
                                            <SelectValue placeholder="All Sources" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-md">
                                            <SelectItem value="all">All Sources</SelectItem>
                                            <SelectItem value="checkin">Check-in</SelectItem>
                                            <SelectItem value="hazard">Hazard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Severity</label>
                                    <Select value={msgSeverity} onValueChange={setMsgSeverity}>
                                        <SelectTrigger className="h-10 rounded-lg bg-muted/40 border-none shadow-none text-sm">
                                            <SelectValue placeholder="All Severities" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-md">
                                            <SelectItem value="all">All Severities</SelectItem>
                                            <SelectItem value="1">Low (1)</SelectItem>
                                            <SelectItem value="2">Medium (2)</SelectItem>
                                            <SelectItem value="3">High (3)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}

                {isReports && (
                    <div className="flex items-center gap-3">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'h-9 rounded-full px-4 gap-2 text-xs font-semibold border-black/5 bg-white shadow-sm hover:bg-slate-50',
                                        reportsHasFilters && 'border-primary text-primary',
                                    )}
                                >
                                    <SlidersHorizontal className="size-3.5" />
                                    Filter
                                    {reportsHasFilters && <span className="size-1.5 rounded-full bg-primary" />}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 rounded-2xl p-4 flex flex-col gap-4 border shadow-xl bg-white" align="end">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm">Filters</h3>
                                    {reportsHasFilters && (
                                        <Button variant="ghost" size="sm" onClick={clearReportsFilters} className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground">
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
                    </div>
                )}
            </PageHeader>

            <div className="flex-1 flex flex-col gap-6 w-full min-h-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col w-full min-h-0">
                    <div className="flex items-center justify-between w-full">
                        <TabsList className="inline-flex w-fit h-10 md:h-12 bg-muted p-1.5 rounded-full overflow-x-auto justify-start border-0">
                            <TabsTrigger
                                value="ai-control"
                                className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
                            >
                                <Bot className="size-[15px] shrink-0 mr-1.5" />
                                AI Control
                            </TabsTrigger>
                            <TabsTrigger
                                value="message-review"
                                className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
                            >
                                <MessageSquare className="size-[15px] shrink-0 mr-1.5" />
                                Message Review
                            </TabsTrigger>
                            <TabsTrigger
                                value="reports-center"
                                className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-muted-foreground transition-all"
                            >
                                <BarChart2 className="size-[15px] shrink-0 mr-1.5" />
                                Reports Center
                            </TabsTrigger>
                        </TabsList>

                        {isReports && (
                            <div className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-1 border border-primary/[0.06] shadow-sm">
                                <div className="size-7 rounded-lg bg-primary/[0.08] flex items-center justify-center">
                                    <FileText className="size-3 text-primary" />
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Generated</span>
                                    <span className="text-sm font-bold text-foreground tabular-nums">{totalCount}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <TabsContent value="ai-control" className="rounded-[12px] outline-none flex-1 data-[state=active]:flex flex-col min-h-0">
                        <AiControlTab />
                    </TabsContent>
                    <TabsContent value="message-review" className="rounded-[12px] outline-none flex-1 data-[state=active]:flex flex-col min-h-0">
                        <MessageReviewTab
                            searchQuery={msgSearch}
                            statusFilter={msgStatus}
                            sourceFilter={msgSource}
                            severityFilter={msgSeverity}
                        />
                    </TabsContent>
                    <TabsContent value="reports-center" className="rounded-[12px] outline-none flex-1 data-[state=active]:flex flex-col min-h-0">
                        <ReportsCenterTab
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            searchQuery={reportSearch}
                            onClearFilters={clearReportsFilters}
                            hasActiveFilters={reportsHasFilters}
                            page={reportPage}
                            limit={reportLimit}
                            reportHistory={reportHistory}
                            onPageChange={setReportPage}
                            onLimitChange={setReportLimit}
                            totalCount={totalCount}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}
