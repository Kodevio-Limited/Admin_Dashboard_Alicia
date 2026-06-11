export type ResidentStatus = 'ACTIVE' | 'DELAYED' | 'SILENT'

export interface ResidentRow {
    id: number
    name: string
    email: string
    community: string
    lastCheckIn: string
    status: ResidentStatus
    avatar: string
}

export let RESIDENTS: ResidentRow[] = [
    {
        id: 1,
        name: 'Elena Rostova',
        email: 'elena@example.com',
        community: 'Zone 3 - Oceanview',
        lastCheckIn: '14 min ago',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 2,
        name: 'Mira Volkov',
        email: 'mira@example.com',
        community: 'Zone 3 - Seaside',
        lastCheckIn: '2 hr ago',
        status: 'DELAYED',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 3,
        name: 'Sofia Petrov',
        email: 'sofia@example.com',
        community: 'Zone 3 - Shoreline',
        lastCheckIn: '8 hr ago',
        status: 'SILENT',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 4,
        name: 'Anya Sokolov',
        email: 'anya@example.com',
        community: 'Zone 3 - Bayfront',
        lastCheckIn: '6 min ago',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 5,
        name: 'Irina Dmitriev',
        email: 'irina@example.com',
        community: 'Zone 3 - Harborview',
        lastCheckIn: '10 min ago',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 6,
        name: 'Nina Orlova',
        email: 'nina@example.com',
        community: 'Zone 3 - Beachside',
        lastCheckIn: '25 min ago',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
]

export async function fetchResidents(): Promise<ResidentRow[]> {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return [...RESIDENTS]
}

export function getResidentById(id: number): ResidentRow | undefined {
    return RESIDENTS.find((r) => r.id === id)
}

export function createResident(data: Omit<ResidentRow, 'id'>): ResidentRow {
    const newResident = { id: Date.now(), ...data }
    RESIDENTS = [...RESIDENTS, newResident]
    return newResident
}

export function updateResident(id: number, data: Partial<ResidentRow>): ResidentRow | undefined {
    const index = RESIDENTS.findIndex((r) => r.id === id)
    if (index !== -1) {
        RESIDENTS[index] = { ...RESIDENTS[index], ...data }
        return RESIDENTS[index]
    }
    return undefined
}

export function deleteResident(id: number): boolean {
    const initialLength = RESIDENTS.length
    RESIDENTS = RESIDENTS.filter((r) => r.id !== id)
    return RESIDENTS.length !== initialLength
}
