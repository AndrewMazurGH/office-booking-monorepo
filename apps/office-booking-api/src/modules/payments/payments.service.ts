import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Inject,
    forwardRef
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from '../../shared/schemas/payment.schema';
import { CreatePaymentDto, PaymentResponseDto } from '../../shared/dto/create-payment.dto';
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

    async createPayment(userId: string, dto: CreatePaymentDto): Promise<PaymentResponseDto> {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            // Validate amount
            if (dto.amount <= 0) {
                throw new BadRequestException('Amount should be greater than 0');
            }

            // Convert IDs to ObjectId
            const userObjectId = new Types.ObjectId(userId);
            const bookingObjectId = new Types.ObjectId(dto.bookingId);

            // Verify booking exists
            const booking = await this.bookingsService.findById(dto.bookingId);
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            // Check booking ownership - compare string representations
            if (booking.userId !== userId) {
                throw new BadRequestException('Booking does not belong to user');
            }

            // Check for existing payments
            const existingPayment = await this.paymentModel.findOne({
                bookingId: bookingObjectId,
                status: { $in: [PaymentStatus.PAID, PaymentStatus.PENDING] }
            }).session(session);

            if (existingPayment) {
                throw new BadRequestException('Payment already exists for this booking');
            }

            // Create payment
            const payment = await this.paymentModel.create([{
                userId: userObjectId,
                bookingId: bookingObjectId,
                amount: dto.amount,
                currency: dto.currency || 'USD',
                status: PaymentStatus.PENDING,
            }], { session });

            await session.commitTransaction();

            return this.mapToResponseDto(payment[0]);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
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

    async updatePayment(id: string, dto: UpdatePaymentDto): Promise<PaymentResponseDto> {
        const payment = await this.findById(id);

        if (payment.status === PaymentStatus.PAID && dto.status === PaymentStatus.PENDING) {
            throw new BadRequestException('Cannot change status from PAID to PENDING');
        }

        const updatedPayment = await this.paymentModel
            .findByIdAndUpdate(id, dto, { new: true })
            .exec();

        if (!updatedPayment) {
            throw new NotFoundException(`Payment #${id} not found`);
        }

        if (dto.status === PaymentStatus.PAID) {
            await this.bookingsService.confirmBooking(payment.bookingId.toString());
        }

        return this.mapToResponseDto(updatedPayment);
    }

    async findById(id: string): Promise<PaymentResponseDto> {
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
}