import { Badge } from '@/components/ui/badge'
import type { DataTableColumn } from '@/components/ui/data-table'
import type { HubRow } from '@/lib/management'
import { HubActionCell } from './HubActionCell'

export const hubColumns: DataTableColumn<HubRow>[] = [
    {
        key: 'hub',
        header: 'HUB DETAILS',
        className: 'font-medium py-2 px-2 text-sm',
        render: (hub) => hub.name,
    },
    {
        key: 'location',
        header: 'LOCATION',
        className: 'py-2 text-center',
        headerClassName: 'text-center',
        render: (hub) => (
            <div className="whitespace-normal max-w-[120px] mx-auto leading-tight">{hub.location}</div>
        ),
    },
    {
        key: 'lastSync',
        header: 'LAST SYNC',
        className: 'py-2 text-center',
        headerClassName: 'text-center',
        render: (hub) => hub.lastSync,
    },
    {
        key: 'status',
        header: 'STATUS',
        className: 'py-2 text-center',
        headerClassName: 'text-center',
        render: (hub) => (
            <Badge
                variant={hub.status === 'ONLINE' ? 'success' : 'destructive'}
                className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
            >
                {hub.status}
            </Badge>
        ),
    },
    {
        key: 'action',
        header: 'ACTION',
        className: 'py-2 text-left pr-4',
        headerClassName: 'text-left pr-4',
        render: (hub) => <HubActionCell hub={hub} />,
    },
]
