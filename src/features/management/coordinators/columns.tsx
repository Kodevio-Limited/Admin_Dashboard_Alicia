import { Badge } from '@/components/ui/badge'
import type { DataTableColumn } from '@/components/ui/data-table'
import type { CoordinatorRow } from '@/lib/management'
import { UserProfile } from '../shared/UserProfile'
import { CoordinatorActionCell } from './CoordinatorActionCell'

export const coordinatorColumns: DataTableColumn<CoordinatorRow>[] = [
    {
        key: 'user',
        header: 'COORDINATOR',
        className: 'font-medium py-2 px-2 text-sm',
        render: (coordinator) => <UserProfile name={coordinator.name} email={coordinator.email} avatar={coordinator.avatar} />,
    },
    {
        key: 'assignedArea',
        header: 'ASSIGNED AREA',
        className: 'py-2 text-center text-muted-foreground',
        headerClassName: 'text-center',
        render: (coordinator) => coordinator.assignedArea,
    },
    {
        key: 'activeHubs',
        header: 'ACTIVE HUBS',
        className: 'py-2 text-center text-muted-foreground',
        headerClassName: 'text-center',
        render: (coordinator) => coordinator.activeHubs,
    },
    {
        key: 'status',
        header: 'STATUS',
        className: 'py-2 text-center',
        headerClassName: 'text-center',
        render: (coordinator) => (
            <Badge
                variant={coordinator.status === 'ACTIVE' ? 'success' : coordinator.status === 'UNASSIGNED' ? 'warning' : 'secondary'}
                className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
            >
                {coordinator.status}
            </Badge>
        ),
    },
    {
        key: 'action',
        header: 'ACTION',
        className: 'py-2 text-right pr-4',
        headerClassName: 'text-right pr-4',
        render: (coordinator) => <CoordinatorActionCell coordinator={coordinator} />,
    },
]
