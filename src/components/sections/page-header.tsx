import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Clock, Search, Loader2 } from 'lucide-react'

export interface PageHeaderProps {
    title: string
    description?: string
    className?: string
    lastUpdated?: string
    children?: React.ReactNode
    searchValue?: string
    onSearchChange?: (val: string) => void
    searchPlaceholder?: string
    searchPrefix?: React.ReactNode
    onSearchKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    searchResults?: Array<{ id: string; place_name: string; center: [number, number] }>
    onSelectResult?: (result: any) => void
    loadingResults?: boolean
}

export function PageHeader({
    title,
    description,
    className,
    lastUpdated,
    children,
    searchValue,
    onSearchChange,
    searchPlaceholder = 'Search region, hub, or incident...',
    searchPrefix,
    onSearchKeyDown,
    searchResults,
    onSelectResult,
    loadingResults = false,
}: PageHeaderProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

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
                    <div
                        ref={containerRef}
                        className={cn(
                            "bg-white h-9 items-center rounded-full w-[260px] lg:w-[320px] pl-1.5 pr-1 transition-colors hover:bg-white/90 hidden md:flex border border-black/5",
                            onSearchChange
                                ? "cursor-text focus-within:border-primary/20 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10"
                                : "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {searchPrefix}
                        <div className="flex items-center gap-1.5 flex-1 min-w-0 px-1.5">
                            <Search className="shrink-0 size-4 text-muted-foreground" />
                            <input
                                type="search"
                                aria-label="Search"
                                placeholder={searchPlaceholder}
                                value={searchValue || ''}
                                onChange={(e) => {
                                    onSearchChange?.(e.target.value)
                                    setDropdownOpen(true)
                                }}
                                onFocus={() => setDropdownOpen(true)}
                                onKeyDown={onSearchKeyDown}
                                disabled={!onSearchChange}
                                className={cn(
                                    "font-medium text-xs md:text-sm text-foreground bg-transparent outline-none w-full placeholder:text-muted-foreground",
                                    !onSearchChange && "cursor-not-allowed"
                                )}
                            />
                            {loadingResults && <Loader2 className="size-3.5 animate-spin text-muted-foreground shrink-0" />}
                        </div>

                        {dropdownOpen && searchResults && searchResults.length > 0 && (
                            <ul className="absolute top-10 left-0 w-full bg-white border border-slate-100 rounded-lg shadow-xl overflow-hidden py-1.5 z-50 list-none p-0 max-h-60 overflow-y-auto pointer-events-auto">
                                {searchResults.map((result) => (
                                    <li
                                        key={result.id}
                                        onClick={() => {
                                            onSelectResult?.(result)
                                            setDropdownOpen(false)
                                        }}
                                        className="px-3 py-2 text-slate-700 text-xs md:text-sm hover:bg-slate-50 cursor-pointer transition-colors truncate"
                                    >
                                        {result.place_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
