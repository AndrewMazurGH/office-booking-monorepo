import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Inject,
    forwardRef,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from '../../shared/schemas/payment.schema';
import { CreatePaymentDto, PaymentResponseDto } from '../../shared/dto/create-payment.dto';
import { UpdatePaymentDto } from '../../shared/dto/update-payment.dto';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus } from '../../shared/interfaces/booking.interface';

@Injectable()
export class PaymentsService {
    private readonly HOURLY_RATE = 100;
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
        @Inject(forwardRef(() => BookingsService))
        private bookingsService: BookingsService,
    ) { }

    private calculateBookingAmount(startDate: Date, endDate: Date): number {
        const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
        return hours * this.HOURLY_RATE;
    }

    async createPayment(userId: string, dto: CreatePaymentDto): Promise<PaymentResponseDto> {
        try {
            // Validate IDs
            if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(dto.bookingId)) {
                throw new BadRequestException('Invalid userId or bookingId format');
            }

            // Get and validate booking
            const booking = await this.bookingsService.findById(dto.bookingId);
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            // Check booking ownership
            if (booking.userId !== userId) {
                throw new BadRequestException('Booking does not belong to user');
            }

            // Validate booking status
            if (booking.status !== BookingStatus.PENDING) {
                throw new BadRequestException('Payment can only be made for pending bookings');
            }

            // Check for existing payment
            const existingPayment = await this.paymentModel.findOne({
                bookingId: new Types.ObjectId(dto.bookingId),
                status: { $in: [PaymentStatus.PAID, PaymentStatus.PENDING] }
            });

            if (existingPayment) {
                throw new BadRequestException('Payment already exists for this booking');
            }

            // Validate payment amount
            const expectedAmount = this.calculateBookingAmount(
                new Date(booking.startDate),
                new Date(booking.endDate)
            );

            if (dto.amount !== expectedAmount) {
                throw new BadRequestException(
                    `Invalid payment amount. Expected: ${expectedAmount}, Received: ${dto.amount}`
                );
            }

            // Create payment
            const payment = await this.paymentModel.create({
                userId: new Types.ObjectId(userId),
                bookingId: new Types.ObjectId(dto.bookingId),
                amount: expectedAmount,
                currency: dto.currency || 'USD',
                status: PaymentStatus.PENDING
            });

            return this.mapToResponseDto(payment);

        } catch (error) {
            this.logger.error(`Error creating payment: ${error.message}`);
            throw error;
        }
    }

    async findPaymentById(id: string): Promise<PaymentResponseDto> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid payment id format');
        }

        const payment = await this.paymentModel.findById(id).exec();
        if (!payment) {
            throw new NotFoundException(`Payment #${id} not found`);
        }

        return this.mapToResponseDto(payment);
    }

    async findAll(userId?: string): Promise<PaymentResponseDto[]> {
        const filter = userId ? { userId: new Types.ObjectId(userId) } : {};
        const payments = await this.paymentModel.find(filter).exec();
        return payments.map(payment => this.mapToResponseDto(payment));
    }

    async updatePayment(id: string, dto: UpdatePaymentDto): Promise<PaymentResponseDto> {
        try {
            const payment = await this.paymentModel.findById(id);
            if (!payment) {
                throw new NotFoundException(`Payment #${id} not found`);
            }

            // Validate status transition
            if (payment.status === PaymentStatus.PAID && dto.status === PaymentStatus.PENDING) {
                throw new BadRequestException('Cannot change status from PAID to PENDING');
            }

            // Update payment
            const updatedPayment = await this.paymentModel
                .findByIdAndUpdate(id, dto, { new: true })
                .exec();

            // If payment is marked as PAID, confirm the booking
            if (dto.status === PaymentStatus.PAID) {
                await this.bookingsService.confirmBooking(payment.bookingId.toString());
            }

            return this.mapToResponseDto(updatedPayment);

        } catch (error) {
            this.logger.error(`Error updating payment: ${error.message}`);
            throw error;
        }
    }

    private mapToResponseDto(payment: PaymentDocument): PaymentResponseDto {
        return {
            id: payment._id.toString(),
            userId: payment.userId.toString(),
            bookingId: payment.bookingId.toString(),
            amount: payment.amount,
            currency: payment.currency || 'USD',
            status: payment.status,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            transactionId: payment.transactionId
        };
    }
}