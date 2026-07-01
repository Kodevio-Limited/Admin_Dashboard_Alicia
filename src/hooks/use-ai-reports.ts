import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
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
    generateReport
} from '@/lib/ai-reports'
import type { MessageReviewStatus } from '@/lib/ai-reports'

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

export function useReportHistory(params?: { page?: number; limit?: number }) {
    return useQuery({
        queryKey: adminKeys.reports(),
        queryFn: () => fetchReportHistory(params),
        // Uses global 5 min staleTime
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
            queryClient.invalidateQueries({ queryKey: adminKeys.aiReporting() })
        },
    })
}

export function useDeleteReport() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.reports() })
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
            queryClient.invalidateQueries({ queryKey: adminKeys.aiControl() })
        },
    })
}

export function useGenerateReport() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: generateReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.reports() })
        },
    })
}
