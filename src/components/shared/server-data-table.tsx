import { Button } from '@/components/ui/button'
import { DataTableFooter, type DataTableColumn } from '@/components/ui/data-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchX } from 'lucide-react'

type ServerDataTableProps<T> = {
    columns: DataTableColumn<T>[]
    data: T[]
    noun?: string
    emptyIcon?: React.ReactNode
    limitOptions?: number[]
    onReset?: () => void
    totalCount: number
    page: number
    limit: number
    onPageChange: (page: number) => void
    onLimitChange: (limit: number) => void
    isLoading?: boolean
}

export function ServerDataTable<T>({
    columns,
    data,
    noun = 'rows',
    emptyIcon,
    limitOptions = [5, 10, 20],
    onReset,
    totalCount,
    page,
    limit,
    onPageChange,
    onLimitChange,
    isLoading = false,
}: ServerDataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col.key} className={col.headerClassName}>{col.header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: limit }).map((_, index) => (
                            <TableRow key={index}>
                                {columns.map((col) => (
                                    <TableCell key={col.key} className={col.className}>
                                        <Skeleton className="h-6 w-full max-w-[250px] mx-auto rounded-md" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-48" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-64" />
                    </div>
                </div>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="p-3 bg-muted rounded-full text-muted-foreground animate-pulse">
                    {emptyIcon ?? <SearchX className="h-6 w-6" />}
                </div>
                <div className="max-w-xs">
                    <h3 className="font-semibold text-foreground">No {noun} found</h3>
                    <p className="text-sm text-muted-foreground">
                        No records matched your search query or active filters. Try clearing your parameters!
                    </p>
                </div>
                {onReset && (
                    <Button variant="outline" size="sm" onClick={onReset}>
                        Reset Filters
                    </Button>
                )}
            </div>
        )
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={col.key} className={col.headerClassName}>{col.header}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow key={index}>
                            {columns.map((col) => (
                                <TableCell key={col.key} className={col.className}>
                                    {col.render(row)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <DataTableFooter
                page={page}
                limit={limit}
                total={totalCount}
                onPageChange={onPageChange}
                onLimitChange={onLimitChange}
                limitOptions={limitOptions}
                noun={noun}
            />
        </>
    )
}
