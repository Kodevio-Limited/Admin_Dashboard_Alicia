import React from 'react'
import { cn } from '@/lib/utils'
import { Clock, Search } from 'lucide-react'

export interface PageHeaderProps {
    title: string
    description?: string
    className?: string
    lastUpdated?: string
    children?: React.ReactNode
}

export function PageHeader({ title, description, className, lastUpdated, children }: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col md:flex-row md:items-start justify-between w-full gap-4 shrink-0', className)}>
            <div className="flex flex-col gap-2">
                <h1 className="font-semibold text-foreground text-lg tracking-tight">{title}</h1>
                {description && <p className="font-medium text-muted-foreground text-sm">{description}</p>}
            </div>

            <div className="flex flex-col items-end gap-1.5 justify-start">
                {lastUpdated && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3.5 shrink-0" />
                        <p className="text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap">Last updated: {lastUpdated}</p>
                    </div>
                )}
                <div className="flex items-center gap-3">
                    {children}
                    <div className="bg-white shadow-sm h-9 items-center gap-2 rounded-full w-[260px] lg:w-[320px] px-3 cursor-text transition-colors hover:bg-white/90 hidden md:flex border border-black/5 focus-within:border-primary/20 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10">
                        <Search className="shrink-0 size-4 text-muted-foreground" />
                        <input
                            type="search"
                            aria-label="Search region, hub, or incident"
                            placeholder="Search region, hub, or incident..."
                            className="font-medium text-xs md:text-sm text-foreground bg-transparent outline-none w-full placeholder:text-muted-foreground"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
