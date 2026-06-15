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
    { id: 10, name: 'Chloe Thompson', email: 'chloe.t@example.com', community: 'Savanna-la-Mar', lastCheckIn: '5 min ago', status: 'ACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 11, name: 'Elijah Wood', email: 'elijah.w@example.com', community: 'Petersfield', lastCheckIn: '3 hr ago', status: 'DELAYED', avatar: '/avatars/shadcn.jpg' },
    { id: 12, name: 'Sophia Martinez', email: 'sophia.m@example.com', community: 'Frome', lastCheckIn: '10 hr ago', status: 'SILENT', avatar: '/avatars/shadcn.jpg' },
    { id: 13, name: 'Liam Neeson', email: 'liam.n@example.com', community: 'Darliston', lastCheckIn: '2 min ago', status: 'ACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 14, name: 'Emma Watson', email: 'emma.w@example.com', community: 'Whithorn', lastCheckIn: '1 hr ago', status: 'ACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 15, name: 'Noah Smith', email: 'noah.s@example.com', community: 'Little London', lastCheckIn: '7 hr ago', status: 'SILENT', avatar: '/avatars/shadcn.jpg' },
    { id: 16, name: 'Olivia Johnson', email: 'olivia.j@example.com', community: 'Negril', lastCheckIn: '30 min ago', status: 'ACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 17, name: 'William Brown', email: 'william.b@example.com', community: 'Lucea', lastCheckIn: '15 min ago', status: 'ACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 18, name: 'Ava Davis', email: 'ava.d@example.com', community: 'Green Island', lastCheckIn: '5 hr ago', status: 'DELAYED', avatar: '/avatars/shadcn.jpg' },
    { id: 19, name: 'Mason Miller', email: 'mason.m@example.com', community: 'Savanna-la-Mar', lastCheckIn: '12 min ago', status: 'ACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 20, name: 'Isabella Wilson', email: 'isabella.w@example.com', community: 'Frome', lastCheckIn: '14 hr ago', status: 'SILENT', avatar: '/avatars/shadcn.jpg' },
    { id: 21, name: 'Ethan Moore', email: 'ethan.m@example.com', community: 'Petersfield', lastCheckIn: '45 min ago', status: 'ACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 22, name: 'Mia Taylor', email: 'mia.t@example.com', community: 'Darliston', lastCheckIn: '1 hr ago', status: 'ACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 23, name: 'Alexander Anderson', email: 'alex.a@example.com', community: 'Whithorn', lastCheckIn: '2 hr ago', status: 'DELAYED', avatar: '/avatars/shadcn.jpg' },
    { id: 24, name: 'Charlotte Thomas', email: 'charlotte.t@example.com', community: 'Little London', lastCheckIn: '8 min ago', status: 'ACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 25, name: 'Daniel Jackson', email: 'daniel.j@example.com', community: 'Negril', lastCheckIn: '11 hr ago', status: 'SILENT', avatar: '/avatars/shadcn.jpg' },
]

export async function fetchResidents(): Promise<ResidentRow[]> {

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
        location: 'Negril Square',
        lastSync: '12 hr ago',
        status: 'OFFLINE',
    },
    {
        id: 9,
        name: 'Lucea Town Hall',
        location: 'Lucea Center',
        lastSync: '30 min ago',
        status: 'ONLINE',
    },
    { id: 10, name: 'Bluefields Health Clinic', location: 'Bluefields Bay', lastSync: '10 min ago', status: 'ONLINE' },
    { id: 11, name: 'Bethel Town High School', location: 'Bethel Town', lastSync: '5 hr ago', status: 'OFFLINE' },
    { id: 12, name: 'Seaford Town Community Centre', location: 'Seaford Town', lastSync: '22 min ago', status: 'ONLINE' },
    { id: 13, name: 'Whitehouse Primary', location: 'Whitehouse Market', lastSync: '1 hr ago', status: 'ONLINE' },
    { id: 14, name: 'Black River Hospital', location: 'Black River', lastSync: '2 min ago', status: 'ONLINE' },
    { id: 15, name: 'Santa Cruz Town Hall', location: 'Santa Cruz', lastSync: '6 hr ago', status: 'OFFLINE' },
    { id: 16, name: 'Malvern Science College', location: 'Malvern Hill', lastSync: '15 min ago', status: 'ONLINE' },
    { id: 17, name: 'Junction Plaza Hub', location: 'Junction Plaza', lastSync: '9 hr ago', status: 'OFFLINE' },
    { id: 18, name: 'Treasure Beach Community Hub', location: 'Treasure Beach', lastSync: '5 min ago', status: 'ONLINE' },
    { id: 19, name: 'Southfield Clinic', location: 'Southfield Station', lastSync: '14 hr ago', status: 'OFFLINE' },
    { id: 20, name: 'Balaclava High', location: 'Balaclava Square', lastSync: '45 min ago', status: 'ONLINE' },
]

export async function fetchHubs(): Promise<HubRow[]> {

    return [...HUBS]
}

export type CoordinatorStatus = 'ACTIVE' | 'INACTIVE' | 'UNASSIGNED'

export interface CoordinatorRow {
    id: number
    name: string
    email: string
    assignedArea: string
    activeHubs: number
    status: CoordinatorStatus
    avatar: string
}

export const COORDINATORS: CoordinatorRow[] = [
    {
        id: 1,
        name: 'Grace Reid',
        email: 'grace.r@example.com',
        assignedArea: 'Savanna-la-Mar Plaza',
        activeHubs: 2,
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 2,
        name: 'Amber Mitchell',
        email: 'amber.m@example.com',
        assignedArea: 'Frome Square',
        activeHubs: 3,
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 3,
        name: 'Omar Symister',
        email: 'omar.s@example.com',
        assignedArea: 'Petersfield Commons',
        activeHubs: 1,
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 4,
        name: 'Juline Asquith',
        email: 'juline.a@example.com',
        assignedArea: 'Little London Park',
        activeHubs: 1,
        status: 'UNASSIGNED',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 5,
        name: 'Racquel Brown',
        email: 'racquel.b@example.com',
        assignedArea: 'Darliston Plaza',
        activeHubs: 1,
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 6,
        name: 'Brandeice Jamieson',
        email: 'brandeice.j@example.com',
        assignedArea: 'Whithorn Pavilion',
        activeHubs: 2,
        status: 'UNASSIGNED',
        avatar: '/avatars/shadcn.jpg',
    },
    { id: 7, name: 'Marie Curie', email: 'marie.c@example.com', assignedArea: 'Bethel Town High School', activeHubs: 1, status: 'INACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 8, name: 'Nikola Tesla', email: 'nikola.t@example.com', assignedArea: 'Seaford Town Community Centre', activeHubs: 2, status: 'ACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 9, name: 'Albert Einstein', email: 'albert.e@example.com', assignedArea: 'Whitehouse Primary', activeHubs: 1, status: 'ACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 10, name: 'Isaac Newton', email: 'isaac.n@example.com', assignedArea: 'Black River Hospital', activeHubs: 3, status: 'ACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 11, name: 'Galileo Galilei', email: 'galileo.g@example.com', assignedArea: 'Santa Cruz Town Hall', activeHubs: 1, status: 'INACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 12, name: 'Charles Darwin', email: 'charles.d@example.com', assignedArea: 'Malvern Science College', activeHubs: 2, status: 'ACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 13, name: 'Stephen Hawking', email: 'stephen.h@example.com', assignedArea: 'Junction Plaza Hub', activeHubs: 1, status: 'INACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 14, name: 'Ada Lovelace', email: 'ada.l@example.com', assignedArea: 'Treasure Beach Community Hub', activeHubs: 2, status: 'ACTIVE', avatar: '/avatars/shadcn.jpg' },
    { id: 15, name: 'Rosalind Franklin', email: 'rosalind.f@example.com', assignedArea: 'Southfield Clinic', activeHubs: 1, status: 'INACTIVE', avatar: '/avatars/shadcn.jpg' },
]

export async function fetchCoordinators(): Promise<CoordinatorRow[]> {

    return [...COORDINATORS]
}

