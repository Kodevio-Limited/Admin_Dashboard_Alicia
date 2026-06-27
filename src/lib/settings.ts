import { client } from './api-client'

export interface StaticContentAPIResult {
    slug: string
    title: string
    content: string
}

interface ApiResponse<T> {
    status: string
    data: T
    message?: string
}

export const staticContentApi = {
    get: async (key: string): Promise<StaticContentAPIResult> => {
        const endpoint = key === 'privacy-policy' ? '/admin/content/privacy-policy/' : '/admin/content/terms/'
        try {
            const response = await client<ApiResponse<StaticContentAPIResult>>(endpoint)
            return response.data
        } catch (err: any) {
            const isNotFound = err?.message?.toLowerCase().includes('not found') || err?.message?.includes('404')
            if (isNotFound) {
                return {
                    slug: key === 'privacy-policy' ? 'privacy-policy' : 'terms',
                    title: key === 'privacy-policy' ? 'Privacy Policy' : 'Terms & Conditions',
                    content: '',
                }
            }
            throw err
        }
    },
    update: async (key: string, payload: { slug: string; title: string; content: string }): Promise<StaticContentAPIResult> => {
        const endpoint = key === 'privacy-policy' ? '/admin/content/privacy-policy/' : '/admin/content/terms/'
        const response = await client<ApiResponse<StaticContentAPIResult>>(endpoint, {
            method: 'PATCH',
            data: payload,
        })
        return response.data
    },
}

export type NotifRow = {
    key: string
    title: string
    description: string
    defaultOn: boolean
}

export interface ProfileData {
    fullName: string
    organization: string
    role: string
    licensedTerritory: string
    email: string
    avatar: string
}

export let PROFILE_DATA: ProfileData = {
    fullName: 'David Plummer',
    organization: 'Stem Spark Solutions',
    role: 'System Administrator',
    licensedTerritory: 'Jamaica',
    email: 'hello@stemsparksolutions.com',
    avatar: '/avatars/profile_dummy.png',
}

export async function fetchProfileData(): Promise<ProfileData> {
    return PROFILE_DATA
}

export function updateProfileData(data: Partial<ProfileData>): ProfileData {
    PROFILE_DATA = { ...PROFILE_DATA, ...data }
    return PROFILE_DATA
}
