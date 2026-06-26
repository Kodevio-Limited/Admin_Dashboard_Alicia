import { client } from '../api-client';

export interface UserProfile {
    role: string;
    full_name: string;
    phone_number: string;
    email: string;
    hub_id: number | null;
    secondary_hub_id: number | null;
    username?: string;
    household_size?: number;
    medical_needs?: string;
    latitude?: string;
    longitude?: string;
    avatar?: string;
}

export interface ProfileResponse {
    status: string;
    data: UserProfile;
    message?: string;
}

export async function getProfile(): Promise<UserProfile> {
    const response = await client<ProfileResponse>('/users/profile/');
    return response.data;
}

export async function updateProfile(data: Partial<UserProfile> | FormData): Promise<UserProfile> {
    const response = await client<ProfileResponse>('/users/profile/', {
        method: 'PUT',
        data,
    });
    return response.data;
}
