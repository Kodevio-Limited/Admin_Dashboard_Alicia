import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/sections/page-header'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/__main/ai-reports')({
    component: AiReportsPage,
})

function AiReportsPage() {
    const [activeTab, setActiveTab] = useState('ai-control')
    const [confidence, setConfidence] = useState(85)
    const [autoClassification, setAutoClassification] = useState(true)

    return (
        <>
            <PageHeader title="AI & Reports" description="Monitor AI performance and manage automated reporting" lastUpdated="05:41:15 PM">
                <Button size="sm">Generate Report</Button>
            </PageHeader>

            <div className="flex-1 flex flex-col gap-6 w-full">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="inline-flex w-fit h-10 md:h-12 bg-muted/50 p-1.5 rounded-full overflow-x-auto justify-start border-0">
                        <TabsTrigger value="ai-control" className="rounded-full px-6 h-full text-sm font-medium">
                            AI Control
                        </TabsTrigger>
                        <TabsTrigger value="message-review" className="rounded-full px-6 h-full text-sm font-medium">Message Review</TabsTrigger>
                        <TabsTrigger value="reports-center" className="rounded-full px-6 h-full text-sm font-medium">Reports Center</TabsTrigger>
                    </TabsList>
                </Tabs>

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
            </div>
        </>
    )
}
