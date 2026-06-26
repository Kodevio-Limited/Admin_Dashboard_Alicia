export const staticContentApi = {
    get: async (key: string) => {
        if (key === "terms-and-conditions") {
            return { content: "<p>This is the default Terms & Conditions content. You can edit this text using the rich text editor below.</p>" };
        }
        return { content: "<p>This is the default Privacy Policy content. You can edit this text using the rich text editor below.</p>" };
    },
    update: async (key: string, content: string) => {
        return true;
    }
};

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
    fullName: "David Plummer",
    organization: "Stem Spark Solutions",
    role: "System Administrator",
    licensedTerritory: "Jamaica",
    email: "hello@stemsparksolutions.com",
    avatar: "/avatars/profile_dummy.png"
}

export async function fetchProfileData(): Promise<ProfileData> {
    return PROFILE_DATA
}

export function updateProfileData(data: Partial<ProfileData>): ProfileData {
    PROFILE_DATA = { ...PROFILE_DATA, ...data }
    return PROFILE_DATA
}
