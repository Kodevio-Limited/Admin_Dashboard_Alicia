import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

export const baseURL = (import.meta.env.VITE_APP_SERVER as string) || '';
export const apiPrefix = (import.meta.env.VITE_API_PREFIX as string) || '/api/v1';

export const apiClient = axios.create({
    baseURL: `${baseURL}${apiPrefix}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor to inject the access token
apiClient.interceptors.request.use(
    (config: any) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor to handle 401 Unauthorized and refresh the token
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // If the error is 401 and we haven't already retried
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                
                // Attempt to refresh the token
                const refreshResponse = await axios.post(`${baseURL}${apiPrefix}/auth/refresh/`, {
                    refresh: refreshToken,
                });
                
                const { access } = refreshResponse.data;
                
                // Save the new access token
                localStorage.setItem('access_token', access);
                
                // Update the Authorization header and retry the original request
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                }
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear tokens and redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                // Optional: Dispatch a custom event or redirect here if needed
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);
