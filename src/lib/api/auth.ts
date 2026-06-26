import { client } from '@/lib/api-client';

export interface LoginResponse {
    status: string;
    data: {
        access: string;
        refresh: string;
    };
    message?: string;
}

export const loginApi = async (credentials: any): Promise<LoginResponse> => {
    return client<LoginResponse>('/auth/login/', { data: credentials });
};

export const logoutApi = async (refreshToken: string) => {
    return client('/auth/logout/', { data: { refresh: refreshToken } });
};

export async function forgotPassword(identifier: string): Promise<any> {
    return client('/auth/forgot-password/', { data: { identifier } });
}

export async function verifyPassword(identifier: string, code: string): Promise<any> {
    return client('/auth/verify-reset-otp/', { data: { identifier, code } });
}

export async function resetPassword(data: { new_password: string; confirm_password: string }, token?: string): Promise<any> {
    const config: any = { data };
    if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
    }
    return client('/auth/reset-password/', config);
}
