import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, Download, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/sections/page-header'
import { Switch } from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
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

export const Route = createFileRoute('/_authenticated/ai-reports')({
    component: AiReportsPage,
})

function MessageReviewTab() {
    const [statusFilter, setStatusFilter] = useState('All')
    const [viewingMessage, setViewingMessage] = useState<MessageReviewRow | null>(null)
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
                            <DropdownMenuItem onSelect={() => setViewingMessage(row)}>View details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => toast.success(`Editing message from ${row.resident}`)}>Edit message</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => toast.success(`Marked as resolved for ${row.resident}`)}>Mark as resolved</DropdownMenuItem>
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

            <Dialog open={!!viewingMessage} onOpenChange={(open) => !open && setViewingMessage(null)}>
                <DialogContent className="max-w-[420px] p-6 sm:rounded-[32px] gap-6 outline-none" showCloseButton={false}>
                    <div className="absolute top-4 right-4">
                        <Button variant="ghost" size="icon" onClick={() => setViewingMessage(null)}>
                            <X className="size-4" />
                        </Button>
                    </div>

                    <DialogHeader className="flex flex-col items-center gap-1.5 pt-2">
                        <DialogTitle className="text-2xl font-bold tracking-tight">Review Message</DialogTitle>
                        <p className="text-sm font-medium text-muted-foreground">{viewingMessage?.resident}</p>
                        <Badge className={cn(
                            "rounded-md px-2 py-0.5 mt-1 border-0 uppercase font-semibold text-[11px] tracking-wider",
                            viewingMessage?.status === 'REVIEWD' || viewingMessage?.status === 'RESOLVED' ? "bg-[#B5F5C6] text-[#0A7B21] hover:bg-[#B5F5C6]" :
                            viewingMessage?.status === 'PENDING' ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" :
                            "bg-red-100 text-red-700 hover:bg-red-100"
                        )}>
                            {viewingMessage?.status}
                        </Badge>
                    </DialogHeader>

                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <span className="text-[13px] font-medium text-muted-foreground">Resident Message</span>
                            <div className="rounded-xl bg-[#F4F4F5] p-4 text-[15px] leading-relaxed font-medium text-foreground">
                                "{viewingMessage?.preview}"
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-[13px] font-medium text-muted-foreground">AI Interpretation Model</span>
                            <div className="rounded-2xl bg-[#F4F4F5] p-5 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-[15px]">Predicted Intent</span>
                                    <Badge className="bg-[#E4E4FA] text-[#3034A0] hover:bg-[#E4E4FA] rounded-md border-0 text-[11px] px-2 py-0.5">
                                        Possible Hazard (Flood)
                                    </Badge>
                                </div>
                                
                                <div className="flex flex-col gap-1.5 text-[13px]">
                                    <p className="text-muted-foreground">Hazard Type: <span className="text-foreground font-semibold">Flood</span></p>
                                    <p className="text-muted-foreground">Approximate Location: <span className="text-foreground font-semibold">Haining Road</span></p>
                                </div>

                                <div className="flex flex-col gap-2 pt-2">
                                    <div className="flex items-center justify-between text-[13px]">
                                        <span className="font-semibold">Confidence Score</span>
                                        <span className="font-bold">68%</span>
                                    </div>
                                    <div className="h-2 w-full bg-[#E5E5E5] rounded-full overflow-hidden flex">
                                        <div className="h-full bg-[#EBD046] w-[68%] rounded-full" />
                                    </div>
                                    <p className="text-[11px] leading-snug text-muted-foreground mt-2">
                                        Model confidence is below threshold. Human verification required before triggering standard response protocols.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 mt-2">
                        <Button 
                            variant="default"
                            className="w-full"
                            onClick={() => {
                                toast.success('Message marked as safe.')
                                setViewingMessage(null)
                            }}
                        >
                            Mark as Safe
                        </Button>
                        <div className="flex gap-3">
                            <Button 
                                variant="secondary"
                                className="flex-1"
                                onClick={() => {
                                    toast('Follow up initiated.')
                                    setViewingMessage(null)
                                }}
                            >
                                Follow Up
                            </Button>
                            <Button 
                                variant="destructive"
                                className="flex-1"
                                onClick={() => {
                                    toast.error('Escalated to critical!')
                                    setViewingMessage(null)
                                }}
                            >
                                Escalate to Critical
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
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
                    <div className="flex-1 bg-[#EBEBEB] rounded-xl p-5 flex flex-col gap-1.5">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">GENERATED</span>
                        <span className="text-[32px] leading-none font-bold text-foreground mt-1">124</span>
                    </div>
                    <div className="flex-1 bg-[#EBEBEB] rounded-xl p-5 flex flex-col gap-1.5">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">NEXT AUTO</span>
                        <span className="text-[26px] leading-none font-bold text-foreground mt-2.5 tracking-tight">Tomorrow</span>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <span className="text-[17px] font-bold text-foreground">Auto Reporting</span>
                        <Switch defaultChecked className="data-[state=checked]:bg-[#03063A] scale-125 origin-right" />
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <span className="text-[13px] font-medium text-muted-foreground">Frequency</span>
                        <Select defaultValue="weekly">
                            <SelectTrigger className="w-full bg-[#EBEBEB] border-0 rounded-3xl h-[52px] text-[15px] font-medium px-5 shadow-none">
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-6 mt-4">
                        <div className="flex items-center gap-4">
                            <Checkbox id="activity" defaultChecked className="rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-black data-[state=checked]:text-white data-[state=checked]:border-black h-5 w-5" />
                            <label htmlFor="activity" className="text-[15px] font-medium leading-none cursor-pointer">Activity Summary</label>
                        </div>
                        <div className="flex items-center gap-4">
                            <Checkbox id="hubs" defaultChecked className="rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-black data-[state=checked]:text-white data-[state=checked]:border-black h-5 w-5" />
                            <label htmlFor="hubs" className="text-[15px] font-medium leading-none cursor-pointer">Hubs Summary</label>
                        </div>
                        <div className="flex items-center gap-4">
                            <Checkbox id="alerts" defaultChecked className="rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-black data-[state=checked]:text-white data-[state=checked]:border-black h-5 w-5" />
                            <label htmlFor="alerts" className="text-[15px] font-medium leading-none cursor-pointer">Alerts Summary</label>
                        </div>
                        <div className="flex items-center gap-4">
                            <Checkbox id="ai" defaultChecked className="rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-black data-[state=checked]:text-white data-[state=checked]:border-black h-5 w-5" />
                            <label htmlFor="ai" className="text-[15px] font-medium leading-none cursor-pointer">AI Performance</label>
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

    const handleAutoClassificationChange = (checked: boolean) => {
        setAutoClassification(checked)
        if (checked) {
            toast.success('Auto-Classification Enabled', {
                description: 'Messages will be automatically classified based on the confidence threshold.',
            })
        } else {
            toast('Auto-Classification Disabled', {
                description: 'All incoming messages will now require manual review.',
            })
        }
    }

    return (
        <>
            <PageHeader title="AI & Reports" description="Monitor AI performance and manage automated reporting" lastUpdated="05:41:15 PM">
                <Button variant="default">
                    Generate Report
                </Button>
            </PageHeader>

            <div className="flex-1 flex flex-col gap-6 w-full min-h-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 w-full">
                    <TabsList className="inline-flex w-fit h-10 md:h-12 bg-[#DFDFDF] p-1.5 rounded-full overflow-x-auto justify-start border-0">
                        <TabsTrigger value="ai-control" className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#03063A] data-[state=active]:shadow-sm text-[#737373] transition-all">
                            AI Control
                        </TabsTrigger>
                        <TabsTrigger value="message-review" className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#03063A] data-[state=active]:shadow-sm text-[#737373] transition-all">
                            Message Review
                        </TabsTrigger>
                        <TabsTrigger value="reports-center" className="rounded-full px-6 h-full text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#03063A] data-[state=active]:shadow-sm text-[#737373] transition-all">
                            Reports Center
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai-control" className="mt-6 flex flex-col gap-4 outline-none w-full flex-1">
                        <div className="rounded-2xl bg-[#E4E4E4] border border-black/[0.03] shadow-sm p-6">
                            <div className="space-y-1">
                                <h2 className="text-[17px] font-semibold text-foreground tracking-tight">Confidence Threshold</h2>
                                <p className="text-sm text-muted-foreground">Minimum AI confidence required to auto-classify a message.</p>
                            </div>

                            <div className="mt-14 relative">
                                <div className="absolute right-0 -top-11 text-[28px] font-bold text-[#03063A] tracking-tight">{confidence}%</div>
                                <input
                                    type="range"
                                    min={50}
                                    max={99}
                                    value={confidence}
                                    onChange={(event) => setConfidence(Number(event.target.value))}
                                    className="w-full h-2.5 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#03063A] [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#03063A] [&::-moz-range-thumb]:border-0 cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #03063A 0%, #03063A ${((confidence - 50) / 49) * 100}%, #B4B9D6 ${((confidence - 50) / 49) * 100}%, #B4B9D6 100%)`
                                    }}
                                />
                                <div className="flex justify-between text-[11px] text-muted-foreground mt-2.5 font-medium">
                                    <span>Passes More (50%)</span>
                                    <span>Flags More (99%)</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-[#E4E4E4] border border-black/[0.03] shadow-sm p-6 flex items-center justify-between gap-6">
                            <div className="space-y-1 flex-1">
                                <h2 className="text-[17px] font-semibold text-foreground tracking-tight">Enable Auto-Classification</h2>
                                <p className="text-sm text-muted-foreground">
                                    If disabled, all incoming messages will require manual human review regardless of confidence score.
                                </p>
                            </div>
                            <Switch 
                                checked={autoClassification} 
                                onCheckedChange={handleAutoClassificationChange} 
                                className="data-[state=checked]:bg-[#03063A] scale-125 origin-right" 
                            />
                        </div>

                        <div className="rounded-2xl bg-[#E4E4E4] border border-black/[0.03] shadow-sm p-6 flex items-center justify-between gap-6">
                            <div className="space-y-1 flex-1">
                                <h2 className="text-[17px] font-semibold text-foreground tracking-tight">Report Frequency</h2>
                                <p className="text-sm text-muted-foreground">
                                    Select how often automated performance reports are generated.
                                </p>
                            </div>
                            <Select defaultValue="60min">
                                <SelectTrigger className="w-fit min-w-[160px] bg-white border border-[#E5E5E5] rounded-xl h-10 shadow-sm text-sm font-medium">
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="60min">Every 60 minutes</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                </SelectContent>
                            </Select>
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
