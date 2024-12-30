import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from '../../shared/dto/create-booking.dto';
import { UpdateBookingDto } from '../../shared/dto/update-booking.dto';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserRole } from '../../shared/utils/user-role.enum';
import { BookingStatus } from '../../shared/interfaces/booking.interface';
import { Types } from 'mongoose';

describe('BookingsController', () => {
    let controller: BookingsController;
    let service: BookingsService;

    const mockBooking = {
        id: new Types.ObjectId().toString(),
        userId: new Types.ObjectId().toString(),
        cabinId: new Types.ObjectId().toString(),
        startDate: new Date('2024-01-01T09:00:00Z'),
        endDate: new Date('2024-01-01T10:00:00Z'),
        status: BookingStatus.PENDING,
        notes: 'Test booking'
    };

    const mockBookingsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        findByUser: jest.fn(),
        update: jest.fn(),
        cancel: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BookingsController],
            providers: [
                {
                    provide: BookingsService,
                    useValue: mockBookingsService,
                },
            ],
        }).compile();

        controller = module.get<BookingsController>(BookingsController);
        service = module.get<BookingsService>(BookingsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        const createBookingDto: CreateBookingDto = {
            cabinId: new Types.ObjectId().toString(),
            startDate: new Date('2024-01-01T09:00:00Z'),
            endDate: new Date('2024-01-01T10:00:00Z'),
            notes: 'Test booking'
        };

        it('should create a booking successfully', async () => {
            const userId = new Types.ObjectId().toString();
            mockBookingsService.create.mockResolvedValue(mockBooking);

            const result = await controller.create(userId, createBookingDto);

            expect(service.create).toHaveBeenCalledWith(userId, createBookingDto);
            expect(result).toEqual(mockBooking);
        });

        it('should throw BadRequestException when service throws it', async () => {
            const userId = new Types.ObjectId().toString();
            mockBookingsService.create.mockRejectedValue(new BadRequestException());

            await expect(controller.create(userId, createBookingDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('getAll', () => {
        it('should return all bookings for admin/manager', async () => {
            const mockBookings = [mockBooking];
            mockBookingsService.findAll.mockResolvedValue(mockBookings);

            const result = await controller.getAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual(mockBookings);
        });
    });

    describe('findMyBookings', () => {
        it('should return user bookings', async () => {
            const userId = new Types.ObjectId().toString();
            const mockUserBookings = [mockBooking];
            mockBookingsService.findByUser.mockResolvedValue(mockUserBookings);

            const result = await controller.findMyBookings(userId);

            expect(service.findByUser).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockUserBookings);
        });

        it('should throw BadRequestException when userId is missing', async () => {
            await expect(controller.findMyBookings(undefined)).rejects.toThrow(BadRequestException);
        });
    });

    describe('findOne', () => {
        it('should return booking for admin role', async () => {
            const bookingId = new Types.ObjectId().toString();
            const userId = new Types.ObjectId().toString();
            mockBookingsService.findById.mockResolvedValue(mockBooking);

            const result = await controller.findOne(bookingId, userId, UserRole.ADMIN);

            expect(service.findById).toHaveBeenCalledWith(bookingId);
            expect(result).toEqual(mockBooking);
        });

        it('should throw ForbiddenException for non-owner regular user', async () => {
            const bookingId = new Types.ObjectId().toString();
            const userId = new Types.ObjectId().toString();
            mockBookingsService.findById.mockResolvedValue({
                ...mockBooking,
                userId: new Types.ObjectId().toString(), // Different user ID
            });

            await expect(
                controller.findOne(bookingId, userId, UserRole.USER)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('update', () => {
        const updateBookingDto: UpdateBookingDto = {
            notes: 'Updated notes'
        };

        it('should update booking for admin role', async () => {
            const bookingId = new Types.ObjectId().toString();
            const userId = new Types.ObjectId().toString();
            mockBookingsService.findById.mockResolvedValue(mockBooking);
            mockBookingsService.update.mockResolvedValue({ ...mockBooking, ...updateBookingDto });

            const result = await controller.update(bookingId, userId, UserRole.ADMIN, updateBookingDto);

            expect(service.update).toHaveBeenCalledWith(bookingId, updateBookingDto);
            expect(result).toEqual({ ...mockBooking, ...updateBookingDto });
        });

        it('should throw ForbiddenException for non-owner regular user', async () => {
            const bookingId = new Types.ObjectId().toString();
            const userId = new Types.ObjectId().toString();
            mockBookingsService.findById.mockResolvedValue({
                ...mockBooking,
                userId: new Types.ObjectId().toString(), // Different user ID
            });

            await expect(
                controller.update(bookingId, userId, UserRole.USER, updateBookingDto)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('cancel', () => {
        it('should cancel booking for admin role', async () => {
            const bookingId = new Types.ObjectId().toString();
            const userId = new Types.ObjectId().toString();
            mockBookingsService.findById.mockResolvedValue(mockBooking);
            mockBookingsService.cancel.mockResolvedValue({ ...mockBooking, status: BookingStatus.CANCELLED });

            const result = await controller.cancel(bookingId, userId, UserRole.ADMIN);

            expect(service.cancel).toHaveBeenCalledWith(bookingId, userId);
            expect(result).toEqual({ ...mockBooking, status: BookingStatus.CANCELLED });
        });

        it('should throw ForbiddenException for non-owner regular user', async () => {
            const bookingId = new Types.ObjectId().toString();
            const userId = new Types.ObjectId().toString();
            mockBookingsService.findById.mockResolvedValue({
                ...mockBooking,
                userId: new Types.ObjectId().toString(), // Different user ID
            });

            await expect(
                controller.cancel(bookingId, userId, UserRole.USER)
            ).rejects.toThrow(ForbiddenException);
        });
    });
});