import { PaymentStatus } from '../schemas/payment.schema';

export class PaymentResponse {
    id: string;
    userId: string;
    bookingId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    transactionId?: string;
    createdAt: Date;
    updatedAt: Date;
}