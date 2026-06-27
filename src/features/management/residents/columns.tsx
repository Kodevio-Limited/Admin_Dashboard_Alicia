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
            try {
                return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' }).format(
                    new Date(resident.last_checkin),
                )
            } catch {
                return resident.last_checkin
            }
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
