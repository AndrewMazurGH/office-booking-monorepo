import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

@Schema({ timestamps: true })
export class Payment {
    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId;   // Якщо ви хочете зберігати, хто платить

    @Prop({ type: Types.ObjectId, required: true })
    bookingId: Types.ObjectId; // Посилання на бронювання

    @Prop({ required: true })
    amount: number;   // Сума (наприклад, 100.00)

    @Prop({ default: 'USD' })
    currency: string; // Валюта (USD, EUR, UAH)

    @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Prop()
    transactionId?: string;  // ID транзакції з платіжної системи

    // За потреби можна додати більше полів: платіжний шлюз, метадані, коментарі тощо
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
