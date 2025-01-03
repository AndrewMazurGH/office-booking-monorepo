import { useState, useCallback } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import api from '../services/api';
import { 
  Booking, 
  Payment, 
  User, 
  UserRole,
  PaymentStatus,
  Cabin
} from '@office-booking-monorepo/types';

interface ApiError {
  message: string;
  status?: number;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const request = useCallback(async <T,>(
    method: string,
    url: string,
    data?: unknown,
    options = {}
  ): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      
      const response: AxiosResponse<T> = await api({
        method,
        url,
        data,
        ...options
      });
      
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || 'An error occurred';
      const errorStatus = error.response?.status;
      
      const apiError: ApiError = {
        message: errorMessage,
        status: errorStatus
      };
      
      setError(apiError);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(<T,>(url: string, options = {}) => 
    request<T>('GET', url, null, options), [request]);

  const post = useCallback(<T,>(url: string, data: unknown, options = {}) => 
    request<T>('POST', url, data, options), [request]);

  const put = useCallback(<T,>(url: string, data: unknown, options = {}) => 
    request<T>('PUT', url, data, options), [request]);

  const del = useCallback(<T,>(url: string, options = {}) => 
    request<T>('DELETE', url, null, options), [request]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del
  };
};

// Type definitions for specific API responses
interface BookingResponse {
  bookings: Booking[];
  total: number;
}

interface PaymentResponse {
  payments: Payment[];
  total: number;
}

// Create hooks for specific features
export const useBookings = () => {
  const api = useApi();

  return {
    loading: api.loading,
    error: api.error,
    getAll: () => api.get<BookingResponse>('/api/bookings'),
    getMyBookings: () => api.get<Booking[]>('/api/bookings/my-bookings'),
    getById: (id: string) => api.get<Booking>(`/api/bookings/${id}`),
    create: (data: Partial<Booking>) => api.post<Booking>('/api/bookings', data),
    update: (id: string, data: Partial<Booking>) => 
      api.put<Booking>(`/api/bookings/${id}`, data),
    cancel: (id: string) => api.delete<void>(`/api/bookings/${id}`)
  };
};

export const usePayments = () => {
  const api = useApi();

  return {
    loading: api.loading,
    error: api.error,
    getAll: () => api.get<PaymentResponse>('/api/payments'),
    getMyPayments: () => api.get<Payment[]>('/api/payments/my-payments'),
    getById: (id: string) => api.get<Payment>(`/api/payments/${id}`),
    create: (data: Partial<Payment>) => api.post<Payment>('/api/payments', data),
    update: (id: string, status: PaymentStatus) => 
      api.put<Payment>(`/api/payments/${id}`, { status })
  };
};

export const useCabins = () => {
  const api = useApi();

  return {
    loading: api.loading,
    error: api.error,
    getAll: () => api.get<Cabin[]>('/api/cabins'),
    getById: (id: string) => api.get<Cabin>(`/api/cabins/${id}`)
  };
};

export const useUsers = () => {
  const api = useApi();

  return {
    loading: api.loading,
    error: api.error,
    getAll: () => api.get<User[]>('/api/users'),
    getById: (id: string) => api.get<User>(`/api/users/${id}`),
    getMe: () => api.get<User>('/api/users/me'),
    create: (data: Partial<User>) => api.post<User>('/api/users/register', data),
    updateRole: (id: string, role: UserRole) => 
      api.put<User>(`/api/users/${id}/role`, { role })
  };
};