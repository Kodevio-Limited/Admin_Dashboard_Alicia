import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/sections/page-header'
import { Switch } from '@/components/ui/switch'
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

import { fetchMessageReviews, fetchReportHistory } from '@/lib/ai-reports'
import type { MessageReviewRow, ReportHistoryItem } from '@/lib/ai-reports'

export const Route = createFileRoute('/__main/ai-reports')({
    component: AiReportsPage,
})

function MessageReviewTab() {
    const [statusFilter, setStatusFilter] = useState('All')
    const filterOptions = ['All', 'Pending', 'Escalated', 'Resolved']

    const { data: reviews = [], isLoading } = useQuery({
        queryKey: ['message-reviews'],
        queryFn: fetchMessageReviews,
    })

    const filteredReviews = useMemo(() => {
        if (statusFilter === 'All') return reviews
        return reviews.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase())
    }, [reviews, statusFilter])

    const columns: DataTableColumn<MessageReviewRow>[] = useMemo(
        () => [
            {
                key: 'preview',
                header: 'MESSAGE PREVIEW',
                className: 'py-2 px-2 font-medium text-sm',
                headerClassName: 'px-2',
                render: (row: MessageReviewRow) => <div className="max-w-[400px] leading-snug">{row.preview}</div>,
            },
            {
                key: 'resident',
                header: 'RESIDENT',
                className: 'py-2 text-muted-foreground text-left pr-4',
                headerClassName: 'text-left pr-4',
                render: (row: MessageReviewRow) => row.resident,
            },
            {
                key: 'status',
                header: 'STATUS',
                className: 'py-2 text-left pr-4',
                headerClassName: 'text-left pr-4',
                render: (row: MessageReviewRow) => {
                    let variant = 'secondary'
                    if (row.status === 'REVIEWD' || row.status === 'RESOLVED') variant = 'success'
                    if (row.status === 'PENDING') variant = 'warning'
                    if (row.status === 'ESCALATED') variant = 'destructive'
                    
                    return (
                        <Badge variant={variant as any} className="rounded-full px-3 py-1 text-xs font-semibold">
                            {row.status}
                        </Badge>
                    )
                },
            },
            {
                key: 'time',
                header: 'TIME',
                className: 'py-2 text-left pr-4',
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
                            <DropdownMenuItem onSelect={() => console.log('View', row.resident)}>View details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => console.log('Edit', row.resident)}>Edit message</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => console.log('Resolve', row.resident)}>Mark as resolved</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        []
    )

    return (
        <div className="flex-1 flex flex-col gap-4 min-h-0 w-full">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {filterOptions.map(option => (
                    <button
                        key={option}
                        onClick={() => setStatusFilter(option)}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap",
                            statusFilter === option 
                                ? "bg-[#03063A] text-white border-[#03063A]" 
                                : "bg-white text-muted-foreground border-border hover:bg-muted"
                        )}
                    >
                        {option}
                    </button>
                ))}
            </div>

            <Card className="flex-1 overflow-hidden shadow-sm flex flex-col min-h-0">
                <CardContent className="p-4 flex-1 flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading message reviews...</div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-4">
                            <DataTable columns={columns} data={filteredReviews} noun="messages" emptyIcon={<Eye className="h-6 w-6" />} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function ReportsCenterTab() {
    const { data: history = [], isLoading } = useQuery({
        queryKey: ['report-history'],
        queryFn: fetchReportHistory,
    })

    const columns: DataTableColumn<ReportHistoryItem>[] = useMemo(
        () => [
            {
                key: 'info',
                header: '',
                className: 'py-5',
                headerClassName: 'hidden',
                render: (row: ReportHistoryItem) => (
                    <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-foreground text-[15px]">{row.title}</span>
                        <span className="text-xs text-muted-foreground">{row.date}</span>
                    </div>
                ),
            },
            {
                key: 'action',
                header: '',
                className: 'py-5 text-right',
                headerClassName: 'hidden',
                render: () => (
                    <Button variant="secondary">
                        <Download className="h-3.5 w-3.5" /> PDF
                    </Button>
                ),
            },
        ],
        []
    )

    return (
        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 w-full overflow-y-auto md:overflow-hidden pb-6 md:pb-0">
            <Card className="flex-[4] rounded-[20px] bg-white p-6 shadow-sm flex flex-col gap-8 h-max md:h-full md:overflow-y-auto border-0">
                <div className="flex items-center gap-4">
                    <div className="flex-1 bg-muted/50 rounded-xl p-4 flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">GENERATED</span>
                        <span className="text-3xl font-bold text-foreground">124</span>
                    </div>
                    <div className="flex-1 bg-muted/50 rounded-xl p-4 flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">NEXT AUTO</span>
                        <span className="text-2xl font-bold text-foreground pt-1">Tomorrow</span>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">Auto Reporting</span>
                        <Switch defaultChecked />
                    </div>

                    <div className="space-y-2">
                        <span className="text-xs text-muted-foreground">Frequency</span>
                        <Select defaultValue="weekly">
                            <SelectTrigger className="w-full bg-muted/50 border-0 rounded-xl h-11 text-sm font-medium">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                        <div className="flex items-center gap-3">
                            <Checkbox id="activity" defaultChecked className="rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-black data-[state=checked]:text-white data-[state=checked]:border-black" />
                            <label htmlFor="activity" className="text-sm font-medium leading-none cursor-pointer">Activity Summary</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="hubs" defaultChecked className="rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-black data-[state=checked]:text-white data-[state=checked]:border-black" />
                            <label htmlFor="hubs" className="text-sm font-medium leading-none cursor-pointer">Hubs Summary</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="alerts" defaultChecked className="rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-black data-[state=checked]:text-white data-[state=checked]:border-black" />
                            <label htmlFor="alerts" className="text-sm font-medium leading-none cursor-pointer">Alerts Summary</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="ai" defaultChecked className="rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-black data-[state=checked]:text-white data-[state=checked]:border-black" />
                            <label htmlFor="ai" className="text-sm font-medium leading-none cursor-pointer">AI Performance</label>
                        </div>
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
    const [confidence, setConfidence] = useState(85)
    const [autoClassification, setAutoClassification] = useState(true)

    return (
        <>
            <PageHeader title="AI & Reports" description="Monitor AI performance and manage automated reporting" lastUpdated="05:41:15 PM">
                <Button variant="default">
                    Generate Report
                </Button>
            </PageHeader>

            <div className="flex-1 flex flex-col gap-6 w-full min-h-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 w-full">
                    <TabsList className="inline-flex w-fit h-10 md:h-12 bg-muted/50 p-1.5 rounded-full overflow-x-auto justify-start border-0">
                        <TabsTrigger value="ai-control" className="rounded-full px-6 h-full text-sm font-medium">
                            AI Control
                        </TabsTrigger>
                        <TabsTrigger value="message-review" className="rounded-full px-6 h-full text-sm font-medium">Message Review</TabsTrigger>
                        <TabsTrigger value="reports-center" className="rounded-full px-6 h-full text-sm font-medium">Reports Center</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai-control" className="mt-6 flex flex-col gap-6 outline-none">
                        <Card className="rounded-3xl bg-muted p-6 shadow-sm">
                            <CardContent className="space-y-6 p-0">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold text-foreground">Confidence Threshold</h2>
                                    <p className="text-sm text-muted-foreground">Minimum AI confidence required to auto-classify a message.</p>
                                </div>

                                <div className="space-y-4 rounded-[20px] bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-muted-foreground">Confidence</span>
                                        <span className="text-xl font-semibold text-primary">{confidence}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={confidence}
                                        onChange={(event) => setConfidence(Number(event.target.value))}
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Passes More (50%)</span>
                                        <span>Flags More (99%)</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl bg-muted p-6 shadow-sm">
                            <CardContent className="flex flex-col gap-6 p-0">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold text-foreground">Enable Auto-Classification</h2>
                                    <p className="text-sm text-muted-foreground">
                                        If disabled, all incoming messages will require manual human review regardless of confidence score.
                                    </p>
                                </div>
                                <div className="flex justify-end">
                                    <Switch checked={autoClassification} onCheckedChange={setAutoClassification} size="default" />
                                </div>
                            </CardContent>
                        </Card>
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
