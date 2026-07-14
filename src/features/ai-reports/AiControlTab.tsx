import { useState, useEffect } from 'react'
import { Bot, BarChart2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQueryErrorToast } from '@/hooks/use-query-error-toast'
import { useControlConfig, useUpdateControlConfig, useReportingConfig, useUpdateReportingConfig } from '@/hooks/use-ai-reports'
import { ConfigPanel } from './ConfigPanel'
import { freqMinutesToControlString, controlStringToFreqMinutes } from './helpers'

export function AiControlTab() {
    const { data: controlConfig, isError: isControlError, error: controlError } = useControlConfig()
    const { data: reportingConfig, isError: isReportingError, error: reportingError } = useReportingConfig()

    useQueryErrorToast({ key: 'ai-control-config', label: 'AI control configuration', isError: isControlError, error: controlError })
    useQueryErrorToast({ key: 'ai-reporting-config', label: 'AI reporting configuration', isError: isReportingError, error: reportingError })

    const updateControlHook = useUpdateControlConfig()
    const updateReportingHook = useUpdateReportingConfig()

    const saveControl = async (payload: any) => {
        await updateControlHook.mutateAsync(payload)
    }

    const saveReporting = async (payload: any) => {
        await updateReportingHook.mutateAsync(payload)
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
        { id: 'activity', label: 'Activity Summary', desc: 'Check-ins and resident activity events', checked: incActivity, onChange: setIncActivity },
        { id: 'hubs', label: 'Hubs Summary', desc: 'Hub status, uptime, and connectivity', checked: incHubs, onChange: setIncHubs },
        { id: 'alerts', label: 'Alerts Summary', desc: 'Flagged events and hazard reports', checked: incAlerts, onChange: setIncAlerts },
        { id: 'performance', label: 'AI Performance', desc: 'Confidence scores and classification accuracy', checked: incPerformance, onChange: setIncPerformance },
        { id: 'ai-summary', label: 'AI Summary', desc: 'GPT-generated narrative overview of the report', checked: useAiSummary, onChange: setUseAiSummary },
    ]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full flex-1 min-h-0">
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
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full bg-muted/70" />
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
                                    [&::-webkit-slider-thumb]:cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-medium">
                                <span>50%</span>
                                <span>99%</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

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

                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-[13px] font-semibold text-foreground">Report Interval</h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Minutes between auto reports.</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <div className="relative">
                                <input
                                    type="number"
                                    min={1}
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
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-[13px] font-semibold text-foreground">Auto Reporting</h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                {autoReporting ? 'Automatic on schedule.' : 'Manual only.'}
                            </p>
                        </div>
                        <Switch checked={autoReporting} onCheckedChange={setAutoReporting} className="data-[state=checked]:bg-primary shrink-0" />
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-[13px] font-semibold text-foreground mb-2">Report Contents</h3>
                        <div className="flex flex-col gap-0.5">
                            {contentSections.map((section) => (
                                <label
                                    key={section.id}
                                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                                >
                                    <Switch checked={section.checked} onCheckedChange={section.onChange} className="data-[state=checked]:bg-primary" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[13px] font-medium text-foreground leading-tight">{section.label}</span>
                                        <span className="text-[10px] text-muted-foreground truncate leading-tight">{section.desc}</span>
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
