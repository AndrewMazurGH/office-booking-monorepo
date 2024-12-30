import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus } from '../../shared/schemas/payment.schema';
import { BookingsService } from '../bookings/bookings.service';
import { CreatePaymentDto } from '../../shared/dto/create-payment.dto';
import { BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';

describe('PaymentsService', () => {
    let service: PaymentsService;
    let paymentModel: Model<Payment>;
    let bookingsService: BookingsService;
    let connection: Connection;
    let module: TestingModule;

    const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
    };

    const queryChainMock = {
        session: jest.fn().mockReturnThis(), // Дозволяє виклики .session()
        exec: jest.fn().mockResolvedValue(null), // Дозволяє виклики .exec()
    };

    const mockQuery = {
        session: jest.fn().mockReturnThis(),
        exec: jest.fn(),
    };

    const mockPaymentModel = {
        create: jest.fn(),
        findOne: jest.fn().mockReturnValue(queryChainMock),
        findById: jest.fn().mockReturnValue(queryChainMock),
        findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
        find: jest.fn().mockReturnValue({ exec: jest.fn() }),
    };

    const mockConnection = {
        startSession: jest.fn().mockResolvedValue(mockSession),
    };

    const mockBookingsService = {
        findById: jest.fn(),
        confirmBooking: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentsService,
                {
                    provide: getModelToken(Payment.name),
                    useValue: mockPaymentModel
                },
                {
                    provide: getConnectionToken(),
                    useValue: mockConnection
                },
                {
                    provide: BookingsService,
                    useValue: mockBookingsService
                }
            ],
        }).compile();

        service = module.get<PaymentsService>(PaymentsService);
        paymentModel = module.get<Model<Payment>>(getModelToken(Payment.name));
        bookingsService = module.get<BookingsService>(BookingsService);
        connection = module.get(getConnectionToken());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createPayment', () => {
        const userId = new Types.ObjectId().toString();
        const bookingId = new Types.ObjectId().toString();
        const createPaymentDto: CreatePaymentDto = {
            bookingId,
            amount: 100,
            currency: 'USD',
        };

        it('should create a payment successfully', async () => {
            const mockBooking = {
                userId: userId,
                id: bookingId,
            };

            const mockPayment = {
                _id: new Types.ObjectId(),
                userId,
                bookingId,
                amount: 100,
                currency: 'USD',
                status: PaymentStatus.PENDING,
            };

            mockBookingsService.findById.mockResolvedValue(mockBooking);
            mockPaymentModel.findOne.mockResolvedValue(null);
            mockPaymentModel.create.mockResolvedValue([mockPayment]);

            const result = await service.createPayment(userId, createPaymentDto);

            expect(result).toBeDefined();
            expect(result.status).toBe(PaymentStatus.PENDING);
            expect(result.amount).toBe(createPaymentDto.amount);
            expect(mockConnection.startSession).toHaveBeenCalled();
            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it('should throw BadRequestException if amount is less than or equal to 0', async () => {
            const invalidDto = { ...createPaymentDto, amount: 0 };

            await expect(service.createPayment(userId, invalidDto))
                .rejects
                .toThrow(BadRequestException);

            expect(mockSession.startTransaction).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if booking does not exist', async () => {
            mockBookingsService.findById.mockResolvedValue(null);

            await expect(service.createPayment(userId, createPaymentDto))
                .rejects
                .toThrow(NotFoundException);

            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it('should throw BadRequestException if booking belongs to different user', async () => {
            const mockBooking = {
                userId: new Types.ObjectId().toString(),
                id: bookingId,
            };

            mockBookingsService.findById.mockResolvedValue(mockBooking);

            await expect(service.createPayment(userId, createPaymentDto))
                .rejects
                .toThrow(BadRequestException);

            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it('should throw BadRequestException if payment already exists', async () => {
            const mockBooking = {
                userId: userId,
                id: bookingId,
            };

            const existingPayment = {
                _id: new Types.ObjectId(),
                status: PaymentStatus.PENDING,
            };

            mockBookingsService.findById.mockResolvedValue(mockBooking);
            mockPaymentModel.findOne.mockResolvedValue(existingPayment);

            await expect(service.createPayment(userId, createPaymentDto))
                .rejects
                .toThrow(BadRequestException);

            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it('should rollback transaction on error', async () => {
            mockBookingsService.findById.mockRejectedValue(new Error('Test error'));

            await expect(service.createPayment(userId, createPaymentDto))
                .rejects
                .toThrow();

            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });
    });

    describe('updatePayment', () => {
        const paymentId = new Types.ObjectId().toString();
        const mockPayment = {
            _id: paymentId,
            status: PaymentStatus.PENDING,
            bookingId: new Types.ObjectId(),
        };

        it('should update payment status successfully', async () => {
            mockPaymentModel.findById.mockResolvedValue(mockPayment);
            mockPaymentModel.findByIdAndUpdate.mockResolvedValue({
                ...mockPayment,
                status: PaymentStatus.PAID,
            });

            const result = await service.updatePayment(paymentId, { status: PaymentStatus.PAID });

            expect(result.status).toBe(PaymentStatus.PAID);
            expect(mockBookingsService.confirmBooking).toHaveBeenCalledWith(mockPayment.bookingId.toString());
        });

        it('should throw BadRequestException when updating from PAID to PENDING', async () => {
            const paidPayment = { ...mockPayment, status: PaymentStatus.PAID };
            mockPaymentModel.findById.mockResolvedValue(paidPayment);

            await expect(service.updatePayment(paymentId, { status: PaymentStatus.PENDING }))
                .rejects
                .toThrow(BadRequestException);
        });

        it('should throw NotFoundException when payment not found', async () => {
            mockPaymentModel.findById.mockResolvedValue(null);

            await expect(service.updatePayment(paymentId, { status: PaymentStatus.PAID }))
                .rejects
                .toThrow(NotFoundException);
        });
    });

    describe('findById', () => {
        it('should return payment if found', async () => {
            const paymentId = new Types.ObjectId().toString();
            const mockPayment = { _id: paymentId };

            mockPaymentModel.findById.mockResolvedValue(mockPayment);

            const result = await service.findById(paymentId);
            expect(result).toBeDefined();
            expect(result).toEqual(mockPayment);
        });

        it('should throw NotFoundException if payment not found', async () => {
            mockPaymentModel.findById.mockResolvedValue(null);

            await expect(service.findById('nonexistentid'))
                .rejects
                .toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return all payments when no userId provided', async () => {
            const mockPayments = [
                { _id: new Types.ObjectId() },
                { _id: new Types.ObjectId() },
            ];

            mockPaymentModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockPayments),
            });

            const result = await service.findAll();
            expect(result).toEqual(mockPayments);
            expect(mockPaymentModel.find).toHaveBeenCalledWith({});
        });

        it('should return user payments when userId provided', async () => {
            const userId = new Types.ObjectId().toString();
            const mockPayments = [
                { _id: new Types.ObjectId(), userId },
            ];

            mockPaymentModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockPayments),
            });

            const result = await service.findAll(userId);
            expect(result).toEqual(mockPayments);
            expect(mockPaymentModel.find).toHaveBeenCalledWith({
                userId: new Types.ObjectId(userId),
            });
        });
    });
});