interface MapDisasterModeToggleProps {
    showFilters: boolean
    disasterMode: 'Pre-Disaster' | 'Post-Disaster'
    onDisasterModeChange: (mode: 'Pre-Disaster' | 'Post-Disaster') => void
}

export function MapDisasterModeToggle({
    showFilters,
    disasterMode,
    onDisasterModeChange,
}: MapDisasterModeToggleProps) {
    if (!showFilters) return null

    return (
        <div className="absolute right-6 top-6 z-10 pointer-events-auto">
            <div className="flex bg-white rounded-full p-1 shadow-sm border border-slate-100">
                {(['Pre-Disaster', 'Post-Disaster'] as const).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => onDisasterModeChange(mode)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border-none outline-none ${
                            disasterMode === mode ? 'bg-indigo-50 text-primary' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {mode}
                    </button>
                ))}
            </div>
        </div>
    )
}
