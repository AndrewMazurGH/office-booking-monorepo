export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
}

export interface Booking {
    id: string;      // _id на бекенді
    userId: string;
    cabinId: string;
    startDate: string; // ISOString
    endDate: string;   // ISOString
    status: BookingStatus;
    notes?: string;
}
