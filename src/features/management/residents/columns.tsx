import { Badge } from '@/components/ui/badge'
import type { DataTableColumn } from '@/components/ui/data-table'
import type { ResidentAPIResult } from '@/lib/api/management'
import { UserProfile } from '../shared/UserProfile'
import { ResidentActionCell } from './ResidentActionCell'

function getDerivedStatus(isActive: boolean): 'ACTIVE' | 'INACTIVE' {
    return isActive ? 'ACTIVE' : 'INACTIVE'
}

function statusVariant(status: string): 'success' | 'warning' | 'destructive' {
    if (status === 'ACTIVE') return 'success'
    if (status === 'DELAYED') return 'warning'
    return 'destructive'
}

function formatRelativeTime(dateString: string): string {
    try {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()

        if (diffMs < 0) {
            return 'Just now'
        }

        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays > 0) {
            const hours = diffHours % 24
            const dayText = diffDays === 1 ? 'day' : 'days'
            if (hours > 0) {
                const hourText = hours === 1 ? 'hr' : 'hrs'
                return `${diffDays} ${dayText} ${hours} ${hourText} ago`
            }
            return `${diffDays} ${dayText} ago`
        }

        if (diffHours > 0) {
            const mins = diffMins % 60
            const hourText = diffHours === 1 ? 'hour' : 'hours'
            if (mins > 0) {
                return `${diffHours} ${hourText} ${mins} min ago`
            }
            return `${diffHours} ${hourText} ago`
        }

        if (diffMins > 0) {
            return `${diffMins} min ago`
        }

        return 'Just now'
    } catch {
        return dateString
    }
}

export const residentColumns: DataTableColumn<ResidentAPIResult>[] = [
    {
        key: 'user',
        header: 'RESIDENTS',
        className: 'font-medium py-2 px-2 text-sm',
        render: (resident) => (
            <UserProfile name={resident.full_name} email={resident.email || resident.phone_number} avatar={resident.profile_photo || ''} />
        ),
    },
    {
        key: 'community',
        header: 'COMMUNITY',
        className: 'py-2 text-muted-foreground text-left pr-4',
        headerClassName: 'text-left pr-4',
        render: (resident) => resident.community || 'Unassigned',
    },
    {
        key: 'lastCheckIn',
        header: 'LAST CHECK IN',
        className: 'py-2 text-left pr-4',
        headerClassName: 'text-left pr-4',
        render: (resident) => {
            if (!resident.last_checkin) return 'Never'
            return formatRelativeTime(resident.last_checkin)
        },
    },
    {
        key: 'status',
        header: 'STATUS',
        className: 'py-2 text-left pr-4',
        headerClassName: 'text-left pr-4',
        render: (resident) => {
            const status = getDerivedStatus(resident.is_active)
            return (
                <Badge variant={statusVariant(status)} className="rounded-full px-3 py-1 text-xs font-semibold">
                    {status}
                </Badge>
            )
        },
    },
    {
        key: 'action',
        header: 'ACTION',
        className: 'py-2 text-left pr-4',
        headerClassName: 'text-left pr-4',
        render: (resident) => <ResidentActionCell resident={resident} />,
    },
]
