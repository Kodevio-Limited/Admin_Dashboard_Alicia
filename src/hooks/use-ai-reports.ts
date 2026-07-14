import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminKeys } from '@/lib/query-keys'
import {
    fetchMessageReviews,
    getReviewItemDetails,
    updateReviewItemStatus,
    fetchReportHistory,
    getReportingConfig,
    updateReportingConfig,
    deleteReport,
    getControlConfig,
    updateControlConfig,
    generateReport,
    updateReportItem
} from '@/lib/ai-reports'
import type { MessageReviewStatus, ReportHistoryPage } from '@/lib/ai-reports'

export function useMessageReviews(params: { page?: number; limit?: number; status?: string; source?: string; severity?: number }) {
    return useQuery({
        queryKey: adminKeys.messageReviewList(params),
        queryFn: () => fetchMessageReviews(params),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000, // 30 seconds (volatile)
    })
}

export function useMessageReviewDetail(source?: string, id?: number) {
    return useQuery({
        // Fallback to general list key if params missing so it doesn't break, but disabled handles it
        queryKey: source && id ? adminKeys.messageReviewDetail(source, id) : adminKeys.messageReview(),
        queryFn: () => getReviewItemDetails(source as 'hazard' | 'checkin', id!),
        enabled: !!source && !!id,
        staleTime: 30 * 1000,
    })
}

export function useUpdateMessageReviewStatus() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ source, id, status }: { source: string; id: number; status: MessageReviewStatus }) =>
            updateReviewItemStatus(source as 'hazard' | 'checkin', id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.messageReview() })
            // Invalidate detail as well to fix the gap
            queryClient.invalidateQueries({ queryKey: adminKeys.messageReviewDetail(variables.source, variables.id) })
        },
    })
}

export function useReportHistory(params?: { page?: number; limit?: number }, options?: { enabled?: boolean }) {
    return useQuery<ReportHistoryPage>({
        queryKey: adminKeys.reportsList(params as Record<string, any>),
        queryFn: () => fetchReportHistory(params),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
        ...options,
    })
}

export function useReportingConfig() {
    return useQuery({
        queryKey: adminKeys.aiReporting(),
        queryFn: getReportingConfig,
        staleTime: 10 * 60 * 1000, // 10 minutes (stable)
    })
}

export function useUpdateReportingConfig() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateReportingConfig,
        onSuccess: () => {
            toast.success('Configuration updated successfully')
            queryClient.invalidateQueries({ queryKey: adminKeys.aiReporting() })
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Failed to update configuration')
        },
    })
}

export function useDeleteReport() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteReport,
        onSuccess: () => {
            toast.success('Report deleted successfully')
            queryClient.invalidateQueries({ queryKey: adminKeys.reports() })
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Failed to delete report')
        },
    })
}

export function useControlConfig() {
    return useQuery({
        queryKey: adminKeys.aiControl(),
        queryFn: getControlConfig,
        staleTime: 10 * 60 * 1000, // 10 minutes (stable)
    })
}

export function useUpdateControlConfig() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateControlConfig,
        onSuccess: () => {
            toast.success('Configuration updated successfully')
            queryClient.invalidateQueries({ queryKey: adminKeys.aiControl() })
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Failed to update configuration')
        },
    })
}

export function useUpdateReport() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { summary?: string; is_auto?: boolean } }) =>
            updateReportItem(id, data),
        onSuccess: () => {
            toast.success('Report updated successfully')
            queryClient.invalidateQueries({ queryKey: adminKeys.reports() })
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Failed to update report')
        },
    })
}

export function useGenerateReport() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: generateReport,
        onSuccess: () => {
            toast.success('Report generation triggered successfully')
            queryClient.invalidateQueries({ queryKey: adminKeys.reports() })
        },
        onError: (err: any) => {
            toast.error(err?.message || 'Failed to generate report')
        },
    })
}
