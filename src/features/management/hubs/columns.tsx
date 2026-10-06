import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { DataTableColumn } from '@/components/ui/data-table'
import type { HubAPIResult } from '@/lib/api/management'
import { HubActionCell } from './HubActionCell'

export interface GetHubColumnsOptions {
    selectedIds: number[]
    onToggleSelect: (id: number) => void
    onSelectAll: (checked: boolean) => void
    isAllSelected: boolean
}

export function getHubColumns(options?: GetHubColumnsOptions): DataTableColumn<HubAPIResult>[] {
    const cols: DataTableColumn<HubAPIResult>[] = []

    if (options) {
        cols.push({
            key: 'select',
            header: (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={options.isAllSelected}
                        onCheckedChange={(checked) => options.onSelectAll(Boolean(checked))}
                        aria-label="Select all"
                    />
                </div>
            ),
            className: 'w-[44px] py-2 px-2 text-center',
            headerClassName: 'w-[44px] px-2 text-center',
            render: (hub) => (
                <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={options.selectedIds.includes(hub.id)}
                        onCheckedChange={() => options.onToggleSelect(hub.id)}
                        aria-label={`Select ${hub.name}`}
                    />
                </div>
            ),
        })
    }

    cols.push(
        {
            key: 'hub',
            header: 'HUB DETAILS',
            className: 'font-medium py-2 px-2 text-sm',
            render: (hub) => (
                <span className="font-semibold text-foreground">{hub.name}</span>
            ),
        },
        {
            key: 'location',
            header: 'LOCATION',
            className: 'py-2 px-3 w-[260px]',
            headerClassName: 'w-[260px]',
            render: (hub) => <div className="whitespace-normal leading-snug text-sm">{hub.address}</div>,
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
    )

    return cols
}

export const hubColumns: DataTableColumn<HubAPIResult>[] = getHubColumns()
