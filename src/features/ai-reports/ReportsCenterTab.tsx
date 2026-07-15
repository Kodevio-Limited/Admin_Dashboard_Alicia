import { useState, useMemo } from 'react'
import { Eye, Edit, Loader2, Save, XCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { DataTableColumn } from '@/components/ui/data-table'
import { ServerDataTable } from '@/components/shared/server-data-table'
import { cn } from '@/lib/utils'
import { useUpdateReport, useDeleteReport } from '@/hooks/use-ai-reports'
import type { ReportHistoryItem, ReportHistoryPage } from '@/lib/ai-reports'

interface ReportsCenterTabProps {
    dateFrom: string
    dateTo: string
    searchQuery: string
    onClearFilters: () => void
    hasActiveFilters: boolean
    page: number
    limit: number
    reportHistory: ReportHistoryPage | undefined
    onPageChange: (page: number) => void
    onLimitChange: (limit: number) => void
    totalCount: number
}

// Component definitions moved outside to ensure stable references
const ReportDetailsCell = ({ 
    report, 
    isEditing, 
    editSummary, 
    setEditSummary, 
    editIsAuto, 
    setEditIsAuto 
}: { 
    report: ReportHistoryItem
    isEditing: boolean
    editSummary: string
    setEditSummary: (val: string) => void
    editIsAuto: boolean
    setEditIsAuto: (val: boolean) => void
}) => {
    const date = report.created_at ? new Date(report.created_at) : null
    const dateStr = date
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—'

    return (
        <div className="flex flex-col gap-1.5 min-w-0 max-w-full">
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <button
                        type="button"
                        onClick={() => setEditIsAuto(!editIsAuto)}
                        className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                            editIsAuto ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-violet-100 text-violet-700 hover:bg-violet-200',
                        )}
                    >
                        {editIsAuto ? 'Auto' : 'Manual'}
                    </button>
                ) : (
                    <span
                        className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                            report.is_auto ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700',
                        )}
                    >
                        {report.is_auto ? 'Auto' : 'Manual'}
                    </span>
                )}
            </div>
            {isEditing ? (
                <textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    rows={3}
                    autoFocus
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
}

const ReportActionsCell = ({
    report,
    isEditing,
    startEdit,
    cancelEdit,
    saveEdit,
    isUpdating,
    isDeleting,
    deleteReport
}: {
    report: ReportHistoryItem
    isEditing: boolean
    startEdit: (r: ReportHistoryItem) => void
    cancelEdit: () => void
    saveEdit: (id: number) => void
    isUpdating: boolean
    isDeleting: boolean
    deleteReport: (id: number) => void
}) => {
    if (isEditing) {
        return (
            <div className="flex items-center justify-end gap-1.5">
                <Button variant="secondary" size="sm" className="gap-1 h-8 px-2.5" onClick={cancelEdit} disabled={isUpdating}>
                    <XCircle className="size-3.5" />
                    <span className="hidden sm:inline">Cancel</span>
                </Button>
                <Button variant="default" size="sm" className="gap-1 h-8 px-2.5" onClick={() => saveEdit(report.id)} disabled={isUpdating}>
                    {isUpdating ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
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
                        <Download className="size-3.5" />
                        <span className="hidden sm:inline">PDF</span>
                    </Button>
                </a>
            ) : (
                <Button variant="secondary" size="sm" className="gap-1 h-8 px-2.5 opacity-40" disabled>
                    <Download className="size-3.5" />
                    <span className="hidden sm:inline">PDF</span>
                </Button>
            )}
            <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 h-8 px-2"
                disabled={isDeleting}
                onClick={() => deleteReport(report.id)}
            >
                Delete
            </Button>
        </div>
    )
}

export function ReportsCenterTab({
    dateFrom,
    dateTo,
    searchQuery,
    onClearFilters,
    hasActiveFilters,
    page,
    limit,
    reportHistory,
    onPageChange,
    onLimitChange,
    totalCount,
}: ReportsCenterTabProps) {
    const history = reportHistory?.results ?? []

    const updateReportHook = useUpdateReport()
    const deleteReportHook = useDeleteReport()

    const [editingId, setEditingId] = useState<number | null>(null)
    const [editSummary, setEditSummary] = useState('')
    const [editIsAuto, setEditIsAuto] = useState(false)

    const deleteReport = (id: number) => deleteReportHook.mutate(id)

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
            setEditingId(null)
        } catch {
            // Error toast is handled by the hook
        }
    }

    const filteredHistory = useMemo(() => {
        if (!searchQuery && !dateFrom && !dateTo) return history
        return history.filter((report) => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase().trim()
                if (!String(report.id).includes(q) && !report.summary.toLowerCase().includes(q)) return false
            }
            if (dateFrom || dateTo) {
                if (!report.created_at) return false
                const reportDate = new Date(report.created_at)
                if (dateFrom && reportDate < new Date(dateFrom)) return false
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
                render: (report) => {
                    const isEditingThis = editingId === report.id
                    return (
                        <span className={cn('font-semibold text-foreground text-[14px]', isEditingThis && 'text-primary')}>
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
                render: (report) => (
                    <ReportDetailsCell 
                        report={report} 
                        isEditing={editingId === report.id} 
                        editSummary={editSummary} 
                        setEditSummary={setEditSummary} 
                        editIsAuto={editIsAuto} 
                        setEditIsAuto={setEditIsAuto} 
                    />
                ),
            },
            {
                key: 'actions',
                header: 'ACTIONS',
                className: 'py-2 px-2 text-right whitespace-nowrap',
                headerClassName: 'px-2 text-right',
                render: (report) => (
                    <ReportActionsCell 
                        report={report}
                        isEditing={editingId === report.id}
                        startEdit={startEdit}
                        cancelEdit={cancelEdit}
                        saveEdit={saveEdit}
                        isUpdating={updateReportHook.isPending}
                        isDeleting={deleteReportHook.isPending}
                        deleteReport={deleteReport}
                    />
                ),
            },
        ],
        [editingId, editSummary, editIsAuto, updateReportHook.isPending, deleteReportHook.isPending],
    )

    return (
        <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-0">
            <CardContent className="p-4 pb-[6px] flex-1 flex flex-col">
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex flex-col gap-4 min-h-min">
                            <ServerDataTable
                                columns={columns}
                                data={filteredHistory}
                                noun="reports"
                                emptyIcon={<Eye className="size-6" />}
                                onReset={hasActiveFilters ? onClearFilters : undefined}
                                totalCount={totalCount}
                                page={page}
                                limit={limit}
                                onPageChange={(p) => { onPageChange(p); setEditingId(null) }}
                                onLimitChange={(l) => { onLimitChange(l); setEditingId(null) }}
                                isLoading={!reportHistory}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
