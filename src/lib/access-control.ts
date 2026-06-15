export type UserStatus = 'ACTIVE' | 'DISABLED' | 'SUSPEND'

export interface AccessUserRow {
    id: number
    name: string
    email: string
    role: string
    area: string
    status: UserStatus
    avatar: string
}

export let ACCESS_USERS: AccessUserRow[] = [
    {
        id: 1,
        name: 'Grace Reid',
        email: 'contact@domain.com',
        role: 'Admin',
        area: 'Area 3 in Jamaica',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 2,
        name: 'Amber Mitchell',
        email: 'info@website.org',
        role: 'Coordinator',
        area: 'Sector 3 in Jamaica',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 3,
        name: 'Omar Symister',
        email: 'support@service.net',
        role: 'Gov/NGO',
        area: 'Region 3 in Jamaica',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 4,
        name: 'Juline Asquith',
        email: 'hello@company.co',
        role: 'Coordinator',
        area: 'District 3 in Jamaica',
        status: 'SUSPEND',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 5,
        name: 'Brandeice Jamieson',
        email: 'feedback@application.biz',
        role: 'Admin',
        area: 'Locale 3 in Jamaica',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 6,
        name: 'Racquel Brown',
        email: 'admin@platform.io',
        role: 'Coordinator',
        area: 'Zone B in Jamaica',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 7,
        name: 'Anthony Smith',
        email: 'anthony.s@example.com',
        role: 'Viewer',
        area: 'Zone 3',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 8,
        name: 'Laura Martinez',
        email: 'laura.m@example.com',
        role: 'Coordinator',
        area: 'Zone 2',
        status: 'DISABLED',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 9,
        name: 'Kevin Brown',
        email: 'kevin.b@example.com',
        role: 'Viewer',
        area: 'Zone 1',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 10,
        name: 'Rachel Green',
        email: 'rachel.g@example.com',
        role: 'Admin',
        area: 'Global',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
]

export async function fetchAccessUsers(): Promise<AccessUserRow[]> {

    return [...ACCESS_USERS]
}

export function getAccessUserById(id: number): AccessUserRow | undefined {
    return ACCESS_USERS.find((u) => u.id === id)
}

export function createAccessUser(data: Omit<AccessUserRow, 'id'>): AccessUserRow {
    const newUser = { id: Date.now(), ...data }
    ACCESS_USERS = [...ACCESS_USERS, newUser]
    return newUser
}

export function updateAccessUser(id: number, data: Partial<AccessUserRow>): AccessUserRow | undefined {
    const index = ACCESS_USERS.findIndex((u) => u.id === id)
    if (index !== -1) {
        ACCESS_USERS[index] = { ...ACCESS_USERS[index], ...data }
        return ACCESS_USERS[index]
    }
    return undefined
}

export function deleteAccessUser(id: number): boolean {
    const initialLength = ACCESS_USERS.length
    ACCESS_USERS = ACCESS_USERS.filter((u) => u.id !== id)
    return ACCESS_USERS.length !== initialLength
}
