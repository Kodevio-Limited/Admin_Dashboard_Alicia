import { Badge } from '@/components/ui/badge'
import type { DataTableColumn } from '@/components/ui/data-table'
import type { CoordinatorAPIResult } from '@/lib/api/management'
import { UserProfile } from '../shared/UserProfile'
import { CoordinatorActionCell } from './CoordinatorActionCell'

export const coordinatorColumns: DataTableColumn<CoordinatorAPIResult>[] = [
    {
        key: 'user',
        header: 'COORDINATOR',
        className: 'font-medium py-2 px-2 text-sm',
        render: (coordinator) => (
            <UserProfile name={coordinator.full_name} email={coordinator.email || coordinator.phone_number} avatar="" />
        ),
    },
    {
        key: 'assignedArea',
        header: 'HUB',
        className: 'py-2 text-center text-muted-foreground',
        headerClassName: 'text-center',
        render: (coordinator) => coordinator.hub_name || 'Unassigned',
    },
    {
        key: 'phone',
        header: 'PHONE',
        className: 'py-2 text-center text-muted-foreground',
        headerClassName: 'text-center',
        render: (coordinator) => coordinator.phone_number,
    },
    {
        key: 'status',
        header: 'STATUS',
        className: 'py-2 text-center',
        headerClassName: 'text-center',
        render: (coordinator) => (
            <Badge
                variant={coordinator.is_active ? 'success' : 'secondary'}
                className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
            >
                {coordinator.is_active ? 'ACTIVE' : 'INACTIVE'}
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
