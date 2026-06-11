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
        <div className={cn('flex flex-col md:flex-row md:items-baseline justify-between w-full gap-4 shrink-0', className)}>
            <div className="flex flex-col gap-2">
                <h1 className="font-semibold text-[#1e1e20] text-lg tracking-tight">{title}</h1>
                {description && <p className="font-medium text-[#686868] text-sm">{description}</p>}
            </div>

            <div className="flex flex-wrap justify-end gap-4 items-center">
                {lastUpdated && (
                    <div className="flex items-center text-[#989898]">
                        <Clock className="size-4 shrink-0" />
                        <p className="text-sm font-medium whitespace-nowrap">Last updated: {lastUpdated}</p>
                    </div>
                )}
                {children}
                <div className="bg-white shadow-sm h-9 items-center gap-2 rounded-full w-full max-w-sm px-3 cursor-text transition-colors hover:bg-white/90 hidden md:flex border border-black/5 focus-within:border-[#03045e]/20 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#03045e]/10">
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
    )
}
