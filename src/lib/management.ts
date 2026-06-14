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
        name: 'Grace Reid',
        email: 'grace@example.com',
        community: 'Savanna-la-Mar',
        lastCheckIn: '14 min ago',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 2,
        name: 'Omar Symister',
        email: 'omar@example.com',
        community: 'Frome',
        lastCheckIn: '2 hr ago',
        status: 'DELAYED',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 3,
        name: 'Amber Mitchell',
        email: 'amber@example.com',
        community: 'Petersfield',
        lastCheckIn: '6 hr ago',
        status: 'SILENT',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 4,
        name: 'Juline Asquith',
        email: 'juline@example.com',
        community: 'Little London',
        lastCheckIn: '6 min ago',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 5,
        name: 'Racquel Brown',
        email: 'racquel@example.com',
        community: 'Darliston',
        lastCheckIn: '10 min ago',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 6,
        name: 'Diana Spencer',
        email: 'diana@example.com',
        community: 'Whithorn',
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
