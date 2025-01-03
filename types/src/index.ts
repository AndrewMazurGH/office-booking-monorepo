export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    MANAGER = 'manager',
}

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

export interface User {
    id: string;
    email: string;
    role: UserRole;
    nickname?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    createdAt?: Date;
}

export interface Booking {
    id: string;
    userId: string;
    cabinId: string;
    startDate: string;
    endDate: string;
    status: BookingStatus;
    notes?: string;
    cabin?: Cabin;
}

export interface Payment {
    id: string;
    userId: string;
    bookingId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    transactionId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Cabin {
    id: string;
    name: string;
    capacity: number;
    description?: string;
    isAvailable: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}