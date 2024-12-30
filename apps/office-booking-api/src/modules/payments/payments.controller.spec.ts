import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { UsersService } from '../users/users.service';
import { CreatePaymentDto } from '../../shared/dto/create-payment.dto';
import { UpdatePaymentDto } from '../../shared/dto/update-payment.dto';
import { PaymentStatus } from '../../shared/schemas/payment.schema';
import { UserRole } from '../../shared/utils/user-role.enum';
import { ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('PaymentsController', () => {
    let controller: PaymentsController;
    let paymentsService: PaymentsService;
    let usersService: UsersService;

    const mockPaymentsService = {
        createPayment: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        updatePayment: jest.fn(),
    };

    const mockUsersService = {
        hasRole: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentsController],
            providers: [
                {
                    provide: PaymentsService,
                    useValue: mockPaymentsService,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get<PaymentsController>(PaymentsController);
        paymentsService = module.get<PaymentsService>(PaymentsService);
        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createPayment', () => {
        const userId = new Types.ObjectId().toString();
        const createPaymentDto: CreatePaymentDto = {
            bookingId: new Types.ObjectId().toString(),
            amount: 100,
            currency: 'USD',
        };

        it('should create a payment successfully', async () => {
            const mockPayment = {
                id: new Types.ObjectId().toString(),
                ...createPaymentDto,
                userId,
                status: PaymentStatus.PENDING,
            };

            mockPaymentsService.createPayment.mockResolvedValue(mockPayment);

            const result = await controller.createPayment(userId, createPaymentDto);

            expect(result).toBeDefined();
            expect(result).toEqual(mockPayment);
            expect(mockPaymentsService.createPayment).toHaveBeenCalledWith(userId, createPaymentDto);
        });
    });

    describe('findMyPayments', () => {
        const userId = new Types.ObjectId().toString();

        it('should return user payments', async () => {
            const mockPayments = [
                {
                    id: new Types.ObjectId().toString(),
                    userId,
                    amount: 100,
                },
            ];

            mockPaymentsService.findAll.mockResolvedValue(mockPayments);

            const result = await controller.findMyPayments(userId);

            expect(result).toBeDefined();
            expect(result).toEqual(mockPayments);
            expect(mockPaymentsService.findAll).toHaveBeenCalledWith(userId);
        });
    });

    describe('findAll', () => {
        it('should return all payments for admin', async () => {
            const mockPayments = [
                {
                    id: new Types.ObjectId().toString(),
                    amount: 100,
                },
                {
                    id: new Types.ObjectId().toString(),
                    amount: 200,
                },
            ];

            mockPaymentsService.findAll.mockResolvedValue(mockPayments);

            const result = await controller.findAll();

            expect(result).toBeDefined();
            expect(result).toEqual(mockPayments);
            expect(mockPaymentsService.findAll).toHaveBeenCalledWith();
        });
    });

    describe('getPayment', () => {
        const paymentId = new Types.ObjectId().toString();
        const userId = new Types.ObjectId().toString();

        it('should return payment for admin user', async () => {
            const mockPayment = {
                id: paymentId,
                userId: new Types.ObjectId().toString(), // Different user
                amount: 100,
            };

            mockPaymentsService.findById.mockResolvedValue(mockPayment);
            mockUsersService.hasRole.mockResolvedValue(true); // User is admin/manager

            const result = await controller.getPayment(paymentId, userId);

            expect(result).toBeDefined();
            expect(result).toEqual(mockPayment);
        });

        it('should return payment for payment owner', async () => {
            const mockPayment = {
                id: paymentId,
                userId: userId, // Same user
                amount: 100,
            };

            mockPaymentsService.findById.mockResolvedValue(mockPayment);
            mockUsersService.hasRole.mockResolvedValue(false); // User is not admin/manager

            const result = await controller.getPayment(paymentId, userId);

            expect(result).toBeDefined();
            expect(result).toEqual(mockPayment);
        });

        it('should throw ForbiddenException for non-owner non-admin user', async () => {
            const mockPayment = {
                id: paymentId,
                userId: new Types.ObjectId().toString(), // Different user
                amount: 100,
            };

            mockPaymentsService.findById.mockResolvedValue(mockPayment);
            mockUsersService.hasRole.mockResolvedValue(false); // User is not admin/manager

            await expect(controller.getPayment(paymentId, userId))
                .rejects
                .toThrow(ForbiddenException);
        });
    });

    describe('updatePayment', () => {
        const paymentId = new Types.ObjectId().toString();
        const updatePaymentDto: UpdatePaymentDto = {
            status: PaymentStatus.PAID,
        };

        it('should update payment successfully', async () => {
            const mockUpdatedPayment = {
                id: paymentId,
                status: PaymentStatus.PAID,
            };

            mockPaymentsService.updatePayment.mockResolvedValue(mockUpdatedPayment);

            const result = await controller.updatePayment(paymentId, updatePaymentDto);

            expect(result).toBeDefined();
            expect(result).toEqual(mockUpdatedPayment);
            expect(mockPaymentsService.updatePayment).toHaveBeenCalledWith(paymentId, updatePaymentDto);
        });

        it('should throw error when payment update fails', async () => {
            mockPaymentsService.updatePayment.mockRejectedValue(new Error('Update failed'));

            await expect(controller.updatePayment(paymentId, updatePaymentDto))
                .rejects
                .toThrow('Update failed');
        });
    });
});