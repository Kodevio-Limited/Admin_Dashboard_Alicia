import { apiClient } from '@/lib/api-client';

export interface LoginResponse {
    status: string;
    data: {
        access: string;
        refresh: string;
    };
    message?: string;
}

export const loginApi = async (credentials: any): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login/', credentials);
    return response.data;
};

export const logoutApi = async (refreshToken: string) => {
    const response = await apiClient.post('/auth/logout/', { refresh: refreshToken });
    return response.data;
};
