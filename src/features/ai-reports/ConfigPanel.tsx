import { useState } from 'react'
import { Edit, Save, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ConfigPanel({
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
            <Card className="shadow-sm border border-black/[0.04] bg-white overflow-hidden">
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
        <Card className="shadow-sm border border-black/[0.04] bg-white flex flex-col h-full min-h-0 overflow-visible">
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
                    className="shrink-0 rounded-lg h-8 px-3 text-xs"
                >
                    {isEditing ? <><XCircle className="size-3 mr-1" />Cancel</> : <><Edit className="size-3 mr-1" />Edit</>}
                </Button>
            </CardHeader>
            <CardContent className="px-4 py-3 flex-1 min-h-0">
                <fieldset disabled={!isEditing} className={`min-w-0 ${!isEditing ? 'pointer-events-none opacity-60 select-none' : ''}`}>
                    {children}
                </fieldset>
            </CardContent>
            {isEditing && (
                <CardFooter className="flex justify-end gap-2 px-4 py-3 border-t border-border/60 bg-muted/30 shrink-0">
                    <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={() => { setIsEditing(false); onCancel() }} disabled={isPending}>
                        <XCircle className="size-3 mr-1" />Cancel
                    </Button>
                    <Button size="sm" className="rounded-lg h-8 text-xs shadow-sm" onClick={() => onSave().then(() => setIsEditing(false))} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-1.5 size-3 animate-spin" /> : <Save className="size-3 mr-1" />}
                        Save
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
