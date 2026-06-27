import { Badge } from '@/components/ui/badge'
import type { DataTableColumn } from '@/components/ui/data-table'
import type { HubAPIResult } from '@/lib/api/management'
import { HubActionCell } from './HubActionCell'

export const hubColumns: DataTableColumn<HubAPIResult>[] = [
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
        render: (hub) => <div className="whitespace-normal max-w-[120px] mx-auto leading-tight">{hub.address}</div>,
    },
    {
        key: 'battery',
        header: 'BATTERY',
        className: 'py-2 text-center',
        headerClassName: 'text-center',
        render: (hub) => `${hub.battery_percentage}%`,
    },
    {
        key: 'status',
        header: 'STATUS',
        className: 'py-2 text-center',
        headerClassName: 'text-center',
        render: (hub) => (
            <Badge
                variant={
                    hub.status === 'open'
                        ? 'success'
                        : hub.status === 'low_battery' || hub.status === 'critical'
                          ? 'destructive'
                          : 'warning'
                }
                className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
            >
                {hub.status.replace('_', ' ')}
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
