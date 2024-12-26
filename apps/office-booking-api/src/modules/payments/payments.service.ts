import {
    Injectable, NotFoundException, BadRequestException, Inject, forwardRef
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from '../../shared/schemas/payment.schema';
import { CreatePaymentDto } from '../../shared/dto/create-payment.dto';
import { UpdatePaymentDto } from '../../shared/dto/update-payment.dto';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
        @InjectConnection() private readonly connection: Connection,
        @Inject(forwardRef(() => BookingsService))
        private bookingsService: BookingsService,
    ) { }

    async createPayment(userId: string, dto: CreatePaymentDto): Promise<PaymentDocument> {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            // Validate amount
            if (dto.amount <= 0) {
                throw new BadRequestException('Amount should be greater than 0');
            }

            // Verify booking exists and belongs to user
            const booking = await this.bookingsService.findById(dto.bookingId);
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }
            if (booking.userId.toString() !== userId) {
                throw new BadRequestException('Booking does not belong to user');
            }

            // Check for existing payments for this booking
            const existingPayment = await this.paymentModel.findOne({
                bookingId: new Types.ObjectId(dto.bookingId),
                status: { $in: [PaymentStatus.PAID, PaymentStatus.PENDING] }
            }).session(session);

            if (existingPayment) {
                throw new BadRequestException('Payment already exists for this booking');
            }

            // Create payment
            const payment = await this.paymentModel.create([{
                userId: new Types.ObjectId(userId),
                bookingId: new Types.ObjectId(dto.bookingId),
                amount: dto.amount,
                currency: dto.currency || 'USD',
                status: PaymentStatus.PENDING,
            }], { session });

            // Here you could integrate with a payment gateway
            try {
                // await this.processExternalPayment(payment[0]);
                await session.commitTransaction();
                return payment[0];
            } catch (error) {
                await session.abortTransaction();
                await payment[0].updateOne({ status: PaymentStatus.FAILED });
                throw new BadRequestException('Payment processing failed');
            }
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async updatePayment(id: string, dto: UpdatePaymentDto): Promise<PaymentDocument> {
        const payment = await this.findById(id);

        // Add validation logic based on status transitions
        if (payment.status === PaymentStatus.PAID && dto.status === PaymentStatus.PENDING) {
            throw new BadRequestException('Cannot change status from PAID to PENDING');
        }

        // Update payment with null check
        const updatedPayment = await this.paymentModel
            .findByIdAndUpdate(id, dto, { new: true })
            .exec();

        if (!updatedPayment) {
            throw new NotFoundException(`Payment #${id} not found`);
        }

        // If payment is marked as PAID, update booking status
        if (dto.status === PaymentStatus.PAID) {
            await this.bookingsService.confirmBooking(payment.bookingId.toString());
        }

        return updatedPayment;
    }

    // Отримати дані одного платежу
    async findById(id: string): Promise<PaymentDocument> {
        const payment = await this.paymentModel.findById(id).exec();
        if (!payment) {
            throw new NotFoundException(`Payment #${id} not found`);
        }
        return payment;
    }

    // Вибірка всіх платежів користувача (або загалом)
    async findAll(userId?: string): Promise<PaymentDocument[]> {
        const filter = userId ? { userId: new Types.ObjectId(userId) } : {};
        return this.paymentModel.find(filter).exec();
    }

    // (опційно) Реальний виклик платіжного сервісу
    // async processExternalPayment(payment: PaymentDocument) {
    //   // Наприклад, виклик Stripe/PayPal API
    //   // Залежно від результату, оновити payment.status
    // }
}
