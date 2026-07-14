import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface PreviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    content: string
}

export function PreviewDialog({ open, onOpenChange, title, content }: PreviewDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="sm:max-w-5xl w-[92vw] h-[85vh] overflow-hidden flex flex-col p-0 rounded-3xl border-none shadow-2xl bg-slate-900 text-white outline-none"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950">
                    <div>
                        <DialogTitle className="text-lg font-bold tracking-tight text-white">{title}</DialogTitle>
                        <p className="text-xs text-white/50">Draft Version (Live View)</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20 border-none font-semibold px-3 py-1 rounded-full text-xs">
                            Ready to Publish
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 bg-slate-900/60 p-6 md:p-10 overflow-y-auto flex justify-center">
                    <div className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-100 p-8 md:p-16 min-h-[60vh] h-fit relative">
                        <div className="w-12 h-1 bg-primary rounded-full mx-auto mb-8" />
                        <div className="prose prose-slate lg:prose-base max-w-none leading-relaxed text-slate-800">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: content || '<p class="text-center text-muted-foreground italic">No content available.</p>',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
