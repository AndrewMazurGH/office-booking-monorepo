import axios, { AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';

interface RefreshResponse {
    access_token: string;
    refresh_token: string;
}

// Backend URL should match your NestJS server
const BASE_URL = 'http://localhost:3000/api';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('[API] Request Error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        console.log(`[API] Response from ${response.config.url}:`, response.data);
        return response.data;
    },
    (error: AxiosError) => {
        console.error('[API] Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

const api = {
    get: async <T>(url: string, config: AxiosRequestConfig = {}) => {
        return axiosInstance.get<T>(url, config);
    },

    post: async <T>(url: string, data?: any, config: AxiosRequestConfig = {}) => {
        return axiosInstance.post<T>(url, data, config);
    },

    put: async <T>(url: string, data?: any, config: AxiosRequestConfig = {}) => {
        return axiosInstance.put<T>(url, data, config);
    },

    delete: async <T>(url: string, config: AxiosRequestConfig = {}) => {
        return axiosInstance.delete<T>(url, config);
    }
};

export default api;