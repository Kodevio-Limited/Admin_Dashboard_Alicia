import { useState, useMemo } from 'react'
import { Eye, X, BadgeCheck, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import { useQueryErrorToast } from '@/hooks/use-query-error-toast'
import { useMessageReviews, useMessageReviewDetail, useUpdateMessageReviewStatus } from '@/hooks/use-ai-reports'
import type { MessageReviewRow } from '@/lib/ai-reports'

interface MessageReviewTabProps {
    searchQuery: string
    statusFilter: string
    sourceFilter: string
    severityFilter: string
}

const SEVERITY_COLORS: Record<number, string> = {
    1: 'bg-yellow-100 text-yellow-700',
    2: 'bg-orange-100 text-orange-700',
    3: 'bg-red-100 text-red-700',
}
const SEVERITY_LABELS: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' }

const STATUS_VARIANT: Record<string, string> = {
    reviewed: 'success',
    resolved: 'success',
    pending: 'warning',
    escalated: 'destructive',
}

export function MessageReviewTab({
    searchQuery,
    statusFilter,
    sourceFilter,
    severityFilter,
}: MessageReviewTabProps) {
    const [viewingMessage, setViewingMessage] = useState<MessageReviewRow | null>(null)

    const queryParams = {
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(sourceFilter !== 'all' && { source: sourceFilter }),
        ...(severityFilter !== 'all' && { severity: Number(severityFilter) }),
    }

    const { data: page, isLoading, isError, error } = useMessageReviews(queryParams)
    const reviews = page?.results ?? []

    const filteredReviews = useMemo(() => {
        if (!searchQuery.trim()) return reviews
        const q = searchQuery.toLowerCase().trim()
        return reviews.filter(
            (r) =>
                String(r.id).includes(q) ||
                r.preview.toLowerCase().includes(q) ||
                r.resident.toLowerCase().includes(q),
        )
    }, [reviews, searchQuery])

    useQueryErrorToast({ key: 'message-reviews', label: 'Message reviews', isError, error })

    const { data: detailsData, isLoading: isLoadingDetails } = useMessageReviewDetail(
        viewingMessage?.source,
        viewingMessage?.id,
    )

    const updateStatusHook = useUpdateMessageReviewStatus()
    const handleStatusUpdate = (source: 'hazard' | 'checkin', id: number, status: string) =>
        updateStatusHook.mutate(
            { source, id, status } as any,
            {
                onSuccess: () => {
                    toast.success(`Message marked as ${status}`)
                    setViewingMessage(null)
                },
                onError: (err: any) => toast.error(err.message || 'Failed to update message status'),
            },
        )

    const columns: DataTableColumn<MessageReviewRow>[] = useMemo(
        () => [
            {
                key: 'source',
                header: 'SOURCE',
                className: 'py-2 px-2',
                headerClassName: 'px-2',
                render: (row) => (
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
                render: (row) => (
                    <div className="max-w-[360px] truncate leading-snug" title={row.preview}>
                        {row.preview}
                    </div>
                ),
            },
            {
                key: 'resident',
                header: 'REPORTER',
                className: 'py-2 text-muted-foreground pr-4',
                headerClassName: 'text-left pr-4',
                render: (row) => row.resident,
            },
            {
                key: 'severity',
                header: 'SEVERITY',
                className: 'py-2 pr-4',
                headerClassName: 'text-left pr-4',
                render: (row) => {
                    if (row.severity == null) return <span className="text-muted-foreground text-xs">—</span>
                    return (
                        <span
                            className={cn(
                                'text-xs font-semibold px-2 py-0.5 rounded-full',
                                SEVERITY_COLORS[row.severity] ?? 'bg-muted text-muted-foreground',
                            )}
                        >
                            {SEVERITY_LABELS[row.severity] ?? `L${row.severity}`}
                        </span>
                    )
                },
            },
            {
                key: 'status',
                header: 'STATUS',
                className: 'py-2 pr-4',
                headerClassName: 'text-left pr-4',
                render: (row) => (
                    <Badge
                        variant={(STATUS_VARIANT[row.status] ?? 'secondary') as any}
                        className="rounded-full px-3 py-1 text-xs font-semibold capitalize"
                    >
                        {row.status}
                    </Badge>
                ),
            },
            {
                key: 'time',
                header: 'TIME',
                className: 'py-2 pr-4 text-muted-foreground text-sm',
                headerClassName: 'text-left pr-4',
                render: (row) => row.time,
            },
            {
                key: 'action',
                header: 'ACTION',
                className: 'py-2 pr-4',
                headerClassName: 'text-left pr-4',
                render: (row) => (
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
                                onSelect={() => handleStatusUpdate(row.source, row.id, 'resolved')}
                            >
                                Mark as resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => handleStatusUpdate(row.source, row.id, 'escalated')}
                                className="text-destructive focus:text-destructive"
                            >
                                Escalate
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [],
    )

    return (
        <div className="flex-1 flex flex-col gap-4 min-h-0 w-full">
            <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-0">
                <CardContent className="p-4 flex-1 flex flex-col">
                    {isLoading ? (
                        <SkeletonTable rows={10} columns={columns.length} />
                    ) : (
                        <DataTable columns={columns} data={filteredReviews} noun="messages" emptyIcon={<Eye className="size-6" />} />
                    )}
                </CardContent>
            </Card>

            {/* Detail Dialog */}
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
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700',
                                )}
                            >
                                {viewingMessage?.status}
                            </Badge>
                            <Badge
                                variant={viewingMessage?.source === 'hazard' ? 'destructive' : 'secondary'}
                                className="rounded-md px-2 py-0.5 border-0 text-[11px] font-semibold uppercase"
                            >
                                {viewingMessage?.source}
                            </Badge>
                        </div>
                    </DialogHeader>

                    <div className="flex flex-col gap-5">
                        {(viewingMessage?.photo_url || detailsData?.photo_url) && (
                            <div className="rounded-xl overflow-hidden bg-muted aspect-video">
                                <img
                                    src={`${(viewingMessage?.photo_url || detailsData?.photo_url)?.startsWith('http') ? '' : 'http://spark.kodevio.com:8000'}${viewingMessage?.photo_url || detailsData?.photo_url}`}
                                    alt="Report photo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <span className="text-[13px] font-medium text-muted-foreground">Message</span>
                            <div className="rounded-xl bg-muted p-4 text-[15px] leading-relaxed font-medium text-foreground">
                                {viewingMessage?.preview}
                            </div>
                        </div>

                        {isLoadingDetails ? (
                            <div className="rounded-2xl bg-muted p-5 flex items-center justify-center text-sm text-muted-foreground min-h-[80px]">
                                <Loader2 className="size-4 animate-spin mr-2" />
                                Loading details...
                            </div>
                        ) : (
                            <DetailMeta viewingMessage={viewingMessage} details={detailsData} />
                        )}
                    </div>

                    <div className="flex flex-col gap-3 mt-2">
                        <Button
                            variant="default"
                            className="w-full"
                            disabled={updateStatusHook.isPending}
                            onClick={() => viewingMessage && handleStatusUpdate(viewingMessage.source, viewingMessage.id, 'reviewed')}
                        >
                            <BadgeCheck className="size-4 mr-2" />
                            Mark as Reviewed
                        </Button>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                disabled={updateStatusHook.isPending}
                                onClick={() => viewingMessage && handleStatusUpdate(viewingMessage.source, viewingMessage.id, 'resolved')}
                            >
                                Mark Resolved
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                disabled={updateStatusHook.isPending}
                                onClick={() => viewingMessage && handleStatusUpdate(viewingMessage.source, viewingMessage.id, 'escalated')}
                            >
                                <AlertTriangle className="size-4 mr-2" />
                                Escalate
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function DetailMeta({
    viewingMessage,
    details,
}: {
    viewingMessage: MessageReviewRow | null
    details: MessageReviewRow | undefined
}) {
    const d = (key: keyof MessageReviewRow) => details?.[key] ?? viewingMessage?.[key]

    return (
        <div className="rounded-2xl bg-muted p-5 flex flex-col gap-3 text-[13px]">
            {d('hazardType') && (
                <MetaRow label="Hazard Type" value={String(d('hazardType'))} capitalize />
            )}
            {d('hub_name') && <MetaRow label="Hub" value={String(d('hub_name'))} />}
            {d('severity') != null && (
                <MetaRow label="Severity" value={`${d('severity')} / 3`} />
            )}
            {d('risk_score') != null && (
                <MetaRow label="Risk Score" value={String(d('risk_score'))} />
            )}
            {d('latitude') != null && (
                <MetaRow
                    label="Coordinates"
                    value={`${Number(d('latitude')).toFixed(5)}, ${Number(d('longitude')).toFixed(5)}`}
                    mono
                />
            )}
            <MetaRow label="Reported at" value={viewingMessage?.time ?? '—'} />
        </div>
    )
}

function MetaRow({ label, value, capitalize, mono }: { label: string; value: string; capitalize?: boolean; mono?: boolean }) {
    return (
        <div className="flex justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className={cn('font-semibold', capitalize && 'capitalize', mono && 'font-mono text-xs')}>
                {value}
            </span>
        </div>
    )
}

function SkeletonTable({ rows, columns }: { rows: number; columns: number }) {
    return (
        <div className="flex flex-col gap-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    {Array.from({ length: columns }).map((_, j) => (
                        <Skeleton key={j} className="h-6 flex-1 rounded-md" />
                    ))}
                </div>
            ))}
        </div>
    )
}
