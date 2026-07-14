import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import JoditEditor from 'jodit-react'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staticContentApi } from '@/lib/settings'
import { PreviewDialog } from './PreviewDialog'

interface StaticContentEditorProps {
    slug: string
    title: string
}

export function StaticContentEditor({ slug, title }: StaticContentEditorProps) {
    const queryClient = useQueryClient()
    const [content, setContent] = useState('')
    const [isInitialized, setIsInitialized] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    const { data, isLoading, error } = useQuery({
        queryKey: ['static-content', slug],
        queryFn: () => staticContentApi.get(slug),
    })

    const updateContent = useMutation({
        mutationFn: () =>
            staticContentApi.update(slug, {
                slug: data?.slug || slug,
                title: data?.title || title,
                content,
            }),
        onSuccess: () => {
            toast.success(`${title} updated successfully`)
            setIsEditing(false)
            queryClient.invalidateQueries({ queryKey: ['static-content', slug] })
        },
        onError: () => {
            toast.error(`Failed to update ${title}`)
        },
    })

    useEffect(() => {
        if (!isLoading && !isInitialized) {
            setContent(data?.content ?? '')
            setIsInitialized(true)
        }
    }, [data, isLoading, isInitialized])

    const handleCancel = () => {
        if (data) setContent(data.content ?? '')
        setIsEditing(false)
    }

    const config = useMemo(
        () => ({
            height: 512,
            readonly: !isEditing,
            buttons: [
                'bold', 'italic', 'underline', 'strike', 'subscript', 'superscript', '|',
                'font', 'fontsize', 'paragraph', '|',
                'align', 'ul', 'ol', 'outdent', 'indent', '|',
                'table', 'hr', 'link', '|',
                'undo', 'redo',
            ],
            placeholder: 'Start typing...',
        }),
        [isEditing],
    )

    if (isLoading || !isInitialized) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4 text-muted-foreground">
                <Loader2 className="size-8 animate-spin" />
                <p>Loading {title}...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-destructive font-medium">Error loading {title}</p>
            </div>
        )
    }

    const lastUpdated = data?.updated_at
        ? new Date(data.updated_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
        : null

    return (
        <div className="flex-1 flex flex-col gap-6 w-full mt-4">
            <div className="rounded-xl overflow-hidden border shadow-sm">
                <JoditEditor config={config} value={content} onChange={setContent} />
            </div>

            <div className="flex flex-col gap-4 mt-2">
                <p className="text-sm font-medium text-foreground">
                    {lastUpdated
                        ? `Last updated: ${lastUpdated}${data?.last_edited_by ? ` by ${data.last_edited_by}` : ''}.`
                        : 'No update history available.'}
                </p>

                <div className="flex gap-4 w-full">
                    {!isEditing ? (
                        <>
                            <Button
                                size="lg"
                                variant="secondary"
                                className="flex-1 rounded-full text-base h-12 bg-muted/50 hover:bg-muted shadow-none border"
                                onClick={() => setIsPreviewOpen(true)}
                            >
                                Preview
                            </Button>
                            <Button
                                size="lg"
                                variant="default"
                                className="flex-1 rounded-full text-base h-12"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex-1 rounded-full text-base h-12"
                                onClick={handleCancel}
                                disabled={updateContent.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="lg"
                                variant="default"
                                className="flex-1 rounded-full text-base h-12"
                                disabled={updateContent.isPending}
                                onClick={() => updateContent.mutate()}
                            >
                                {updateContent.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <PreviewDialog
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                title={`${title} Preview`}
                content={content}
            />
        </div>
    )
}
