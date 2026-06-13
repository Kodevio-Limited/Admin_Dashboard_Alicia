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
        email: 'example@gmail.com',
        role: 'Admin',
        area: 'Zone 3',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 2,
        name: 'Marc Wilson',
        email: 'example@gmail.com',
        role: 'Coordinator',
        area: 'Zone 3',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 3,
        name: 'Marc Wilson',
        email: 'example@gmail.com',
        role: 'Coordinator',
        area: 'Zone 3',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 4,
        name: 'Marc Wilson',
        email: 'example@gmail.com',
        role: 'Coordinator',
        area: 'Zone 3',
        status: 'DISABLED',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 5,
        name: 'Marc Wilson',
        email: 'example@gmail.com',
        role: 'Admin',
        area: 'Zone 3',
        status: 'ACTIVE',
        avatar: '/avatars/shadcn.jpg',
    },
    {
        id: 6,
        name: 'Marc Wilson',
        email: 'example@gmail.com',
        role: 'Coordinator',
        area: 'Zone 3',
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
