import { Badge } from '@/components/ui/badge'
import type { DataTableColumn } from '@/components/ui/data-table'
import type { ResidentRow, ResidentStatus } from '@/lib/management'
import { UserProfile } from '../shared/UserProfile'
import { ResidentActionCell } from './ResidentActionCell'

function statusVariant(status: ResidentStatus): 'success' | 'warning' | 'destructive' {
    if (status === 'ACTIVE') return 'success'
    if (status === 'DELAYED') return 'warning'
    return 'destructive'
}

export const residentColumns: DataTableColumn<ResidentRow>[] = [
    {
        key: 'user',
        header: 'RESIDENTS',
        className: 'font-medium py-2 px-2 text-sm',
        render: (resident) => <UserProfile {...resident} />,
    },
    {
        key: 'community',
        header: 'COMMUNITY',
        className: 'py-2 text-muted-foreground text-left pr-4',
        headerClassName: 'text-left pr-4',
        render: (resident) => resident.community,
    },
    {
        key: 'lastCheckIn',
        header: 'LAST CHECK IN',
        className: 'py-2 text-left pr-4',
        headerClassName: 'text-left pr-4',
        render: (resident) => resident.lastCheckIn,
    },
    {
        key: 'status',
        header: 'STATUS',
        className: 'py-2 text-left pr-4',
        headerClassName: 'text-left pr-4',
        render: (resident) => (
            <Badge variant={statusVariant(resident.status)} className="rounded-full px-3 py-1 text-xs font-semibold">
                {resident.status}
            </Badge>
        ),
    },
    {
        key: 'action',
        header: 'ACTION',
        className: 'py-2 text-left pr-4',
        headerClassName: 'text-left pr-4',
        render: (resident) => <ResidentActionCell resident={resident} />,
    },
]
