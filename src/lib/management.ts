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
    {
        id: 7,
        name: 'James Anderson',
        email: 'james.a@example.com',
        community: 'Negril',
        lastCheckIn: '1 min ago',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 8,
        name: 'Lisa Wong',
        email: 'lisa.w@example.com',
        community: 'Lucea',
        lastCheckIn: '12 hr ago',
        status: 'SILENT',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 9,
        name: 'Marcus Garvey',
        email: 'marcus.g@example.com',
        community: 'Green Island',
        lastCheckIn: '4 hr ago',
        status: 'DELAYED',
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

export type HubStatus = 'ONLINE' | 'OFFLINE'

export interface HubRow {
    id: number
    name: string
    location: string
    lastSync: string
    status: HubStatus
}

export const HUBS: HubRow[] = [
    {
        id: 1,
        name: 'Savanna-la-Mar Primary School',
        location: 'Savanna Square',
        lastSync: '14 min ago',
        status: 'ONLINE',
    },
    {
        id: 2,
        name: 'Frome Community Centre',
        location: 'Frome Commons',
        lastSync: '14 min ago',
        status: 'ONLINE',
    },
    {
        id: 3,
        name: 'Whithorn Community Centre',
        location: 'Whithorn Circle',
        lastSync: '8 hr ago',
        status: 'OFFLINE',
    },
    {
        id: 4,
        name: 'Petersfield All-Age School',
        location: 'Petersfield Park',
        lastSync: '7 hr ago',
        status: 'OFFLINE',
    },
    {
        id: 5,
        name: 'Little London Primary',
        location: 'Little London Green',
        lastSync: '14 min ago',
        status: 'ONLINE',
    },
    {
        id: 6,
        name: 'Darliston Community Hub',
        location: 'Darliston Junction',
        lastSync: '9 hr ago',
        status: 'OFFLINE',
    },
    {
        id: 7,
        name: 'Grange Hill High School',
        location: 'Grange Hill',
        lastSync: '1 min ago',
        status: 'ONLINE',
    },
    {
        id: 8,
        name: 'Negril Community Clinic',
        location: 'Negril',
        lastSync: '12 hr ago',
        status: 'OFFLINE',
    },
    {
        id: 9,
        name: 'Lucea Town Hall',
        location: 'Lucea',
        lastSync: '30 min ago',
        status: 'ONLINE',
    },
]

export async function fetchHubs(): Promise<HubRow[]> {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return [...HUBS]
}

export type CoordinatorStatus = 'ACTIVE' | 'INACTIVE'

export interface CoordinatorRow {
    id: number
    name: string
    email: string
    assignedHub: string
    phone: string
    status: CoordinatorStatus
    avatar: string
}

export const COORDINATORS: CoordinatorRow[] = [
    {
        id: 1,
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        assignedHub: 'Savanna-la-Mar Primary School',
        phone: '+1 (876) 555-0101',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 2,
        name: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        assignedHub: 'Frome Community Centre',
        phone: '+1 (876) 555-0102',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 3,
        name: 'David Wright',
        email: 'd.wright@example.com',
        assignedHub: 'Whithorn Community Centre',
        phone: '+1 (876) 555-0103',
        status: 'INACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 4,
        name: 'Amanda Brooks',
        email: 'amanda.b@example.com',
        assignedHub: 'Grange Hill High School',
        phone: '+1 (876) 555-0104',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 5,
        name: 'Robert King',
        email: 'robert.k@example.com',
        assignedHub: 'Negril Community Clinic',
        phone: '+1 (876) 555-0105',
        status: 'INACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
]

export async function fetchCoordinators(): Promise<CoordinatorRow[]> {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return [...COORDINATORS]
}

