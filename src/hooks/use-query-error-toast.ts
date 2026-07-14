import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export interface QueryErrorEntry {
    key: string
    label: string
    isError: boolean
    error?: Error | null
}

/**
 * Fires a sonner toast.error() whenever the watched query error state
 * transitions from `false → true`. Uses a `useRef<boolean>` internally
 * to prevent duplicate toasts on re-renders, and resets when the error
 * resolves so re-notification can happen on re-failure.
 *
 * @example
 * ```tsx
 * useQueryErrorToast({ key: 'reports', label: 'Reports data', isError, error })
 * ```
 */
export function useQueryErrorToast({ key, label, isError, error }: QueryErrorEntry) {
    const hasNotified = useRef(false)

    useEffect(() => {
        if (isError && !hasNotified.current) {
            hasNotified.current = true
            toast.error(`${label} failed to load`, {
                description:
                    error?.message || 'Data may be outdated or the server is unreachable.',
                duration: 6000,
            })
        } else if (!isError) {
            hasNotified.current = false
        }
    }, [isError, error?.message, label, key])
}
