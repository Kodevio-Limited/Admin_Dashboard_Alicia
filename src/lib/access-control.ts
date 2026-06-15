export type UserStatus = 'ACTIVE' | 'DISABLED'

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
        name: 'Marc Wilson',
        email: 'marc.wilson@example.com',
        role: 'Admin',
        area: 'Zone 3',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 2,
        name: 'Jessica Lee',
        email: 'jessica.lee@example.com',
        role: 'Coordinator',
        area: 'Zone 1',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 3,
        name: 'David Osei',
        email: 'david.osei@example.com',
        role: 'Coordinator',
        area: 'Zone 2',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 4,
        name: 'Sarah Connor',
        email: 'sarah.c@example.com',
        role: 'Coordinator',
        area: 'Zone 4',
        status: 'DISABLED',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 5,
        name: 'Michael Chang',
        email: 'michael.c@example.com',
        role: 'Admin',
        area: 'Global',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 6,
        name: 'Emily Davis',
        email: 'emily.d@example.com',
        role: 'Coordinator',
        area: 'Zone 5',
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
    await new Promise((resolve) => setTimeout(resolve, 600))
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
