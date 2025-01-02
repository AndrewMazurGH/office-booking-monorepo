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
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true })
    bookingId: Types.ObjectId;

    @Prop({ required: true })
    amount: number;

    @Prop({ default: 'USD' })
    currency: string;

    @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Prop()
    transactionId?: string;

    createdAt: Date;
    updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Add indexes for better query performance
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ bookingId: 1 });