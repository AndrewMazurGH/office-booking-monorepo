import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus } from '../../shared/schemas/payment.schema';
import { BookingsService } from '../bookings/bookings.service';
import { CreatePaymentDto } from '../../shared/dto/create-payment.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PaymentsService', () => {
    let service: PaymentsService;
    let paymentModel: Model<Payment>;
    let bookingsService: BookingsService;
    let connection: Connection;

    // 1. Додаємо детальне логування для mockQuery
    const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        session: jest.fn().mockReturnThis(),
    };

    // 2. Покращуємо mock об'єкти
    const mockPaymentModel = {
        create: jest.fn().mockImplementation((docs) => {
            console.log('Creating payment:', docs);
            return Array.isArray(docs) ? docs : [docs];
        }),
        findOne: jest.fn().mockImplementation(() => {
            console.log('Finding one payment');
            return mockQuery; // Повертаємо mockQuery, який поверне null
        }),
        findById: jest.fn().mockImplementation((id) => {
            console.log('Finding payment by id:', id);
            return mockQuery;
        }),
        findByIdAndUpdate: jest.fn().mockImplementation((id, update) => {
            console.log('Updating payment:', { id, update });
            return mockQuery;
        }),
        find: jest.fn().mockImplementation(() => {
            console.log('Finding payments');
            return mockQuery;
        }),
    };

    // 3. Покращений mock для session
    const mockSession = {
        startTransaction: jest.fn().mockImplementation(() => {
            console.log('Starting transaction');
        }),
        commitTransaction: jest.fn().mockImplementation(() => {
            console.log('Committing transaction');
        }),
        abortTransaction: jest.fn().mockImplementation(() => {
            console.log('Aborting transaction');
        }),
        endSession: jest.fn().mockImplementation(() => {
            console.log('Ending session');
        }),
    };

    const mockConnection = {
        startSession: jest.fn().mockResolvedValue(mockSession),
    };

    const mockBookingsService = {
        findById: jest.fn(),
        confirmBooking: jest.fn(),
    };

    beforeEach(async () => {
        // 4. Скидання всіх моків перед кожним тестом
        jest.clearAllMocks();

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
            mockPaymentModel.create.mockResolvedValue([mockPayment]);
            mockQuery.exec.mockResolvedValue(null);

            const result = await service.createPayment(userId, createPaymentDto);

            expect(result).toBeDefined();
            expect(result.status).toBe(PaymentStatus.PENDING);
            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it('should throw BadRequestException if amount is less than or equal to 0', async () => {
            const invalidDto = { ...createPaymentDto, amount: 0 };

            await expect(service.createPayment(userId, invalidDto))
                .rejects
                .toThrow(BadRequestException);
        });

        it('should throw NotFoundException if booking does not exist', async () => {
            mockBookingsService.findById.mockResolvedValue(null);
            mockQuery.exec.mockResolvedValue(null);

            await expect(service.createPayment(userId, createPaymentDto))
                .rejects
                .toThrow(NotFoundException);

            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(mockSession.abortTransaction).toHaveBeenCalled();
        });
    });

    describe('updatePayment', () => {
        const paymentId = new Types.ObjectId().toString();

        it('should update payment status successfully', async () => {
            const mockPayment = {
                _id: paymentId,
                status: PaymentStatus.PENDING,
                bookingId: new Types.ObjectId(),
            };

            mockPaymentModel.findById.mockImplementation(() => ({
                exec: jest.fn().mockResolvedValue(mockPayment)
            }));

            mockPaymentModel.findByIdAndUpdate.mockImplementation(() => ({
                exec: jest.fn().mockResolvedValue({
                    ...mockPayment,
                    status: PaymentStatus.PAID,
                })
            }));

            const result = await service.updatePayment(paymentId, { status: PaymentStatus.PAID });
            expect(result.status).toBe(PaymentStatus.PAID);
        });

        it('should throw BadRequestException when updating from PAID to PENDING', async () => {
            const paidPayment = {
                _id: paymentId,
                status: PaymentStatus.PAID,
            };

            mockPaymentModel.findById.mockImplementation(() => ({
                exec: jest.fn().mockResolvedValue(paidPayment)
            }));

            await expect(service.updatePayment(paymentId, { status: PaymentStatus.PENDING }))
                .rejects
                .toThrow(BadRequestException);
        });
    });

    describe('findById', () => {
        it('should return payment if found', async () => {
            const paymentId = new Types.ObjectId().toString();
            const mockPayment = { _id: paymentId };

            mockPaymentModel.findById.mockImplementation(() => ({
                exec: jest.fn().mockResolvedValue(mockPayment)
            }));

            const result = await service.findById(paymentId);
            expect(result).toBeDefined();
            expect(result).toEqual(mockPayment);
        });

        it('should throw NotFoundException if payment not found', async () => {
            mockPaymentModel.findById.mockImplementation(() => ({
                exec: jest.fn().mockResolvedValue(null)
            }));

            await expect(service.findById('nonexistentid'))
                .rejects
                .toThrow(NotFoundException);
        });
    });
});