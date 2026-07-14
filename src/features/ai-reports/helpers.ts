export function freqMinutesToControlString(minutes: number): string {
    if (minutes === 1440) return 'daily'
    if (minutes === 10080) return 'weekly'
    if (minutes === 43200) return 'monthly'
    return `${minutes}min`
}

export function controlStringToFreqMinutes(str: string): number {
    if (str === 'daily') return 1440
    if (str === 'weekly') return 10080
    if (str === 'monthly') return 43200
    const match = str.match(/^(\d+)(min|hours|days|hour)$/)
    if (match) {
        const val = parseInt(match[1], 10)
        const unit = match[2].replace('hour', 'hours')
        if (unit === 'min') return val
        if (unit === 'hours') return val * 60
        if (unit === 'days') return val * 1440
    }
    return 60
}
