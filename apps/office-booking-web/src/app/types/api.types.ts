import { UserRole } from '@office-booking-monorepo/types';

export interface UserProfileData {
    id: string;
    email: string;
    phone: string;
    nickname: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    createdAt?: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
}

export interface BookingData {
    id: string;
    cabinId: string;
    startDate: string;
    endDate: string;
    status: string;
    notes?: string;
}