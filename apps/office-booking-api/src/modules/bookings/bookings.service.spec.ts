import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from '../../shared/schemas/booking.schema';
import { CabinsService } from '../cabins/cabins.service';
import { CreateBookingDto } from '../../shared/dto/create-booking.dto';
import { UpdateBookingDto } from '../../shared/dto/update-booking.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '../../shared/interfaces/booking.interface';

describe('BookingsService', () => {
    let service: BookingsService;
    let model: Model<BookingDocument>;
    let cabinsService: CabinsService;

    const mockBooking = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        cabinId: new Types.ObjectId(),
        startDate: new Date('2024-01-01T09:00:00Z'),
        endDate: new Date('2024-01-01T10:00:00Z'),
        status: BookingStatus.PENDING,
        notes: 'Test booking'
    };

    const mockBookingModel = {
        find: jest.fn(),
        findById: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        exec: jest.fn(),
    };

    const mockCabinsService = {
        findById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookingsService,
                {
                    provide: getModelToken(Booking.name),
                    useValue: mockBookingModel,
                },
                {
                    provide: CabinsService,
                    useValue: mockCabinsService,
                },
            ],
        }).compile();

        service = module.get<BookingsService>(BookingsService);
        model = module.get<Model<BookingDocument>>(getModelToken(Booking.name));
        cabinsService = module.get<CabinsService>(CabinsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all bookings', async () => {
            const mockBookings = [mockBooking];
            mockBookingModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockBookings),
            });

            const result = await service.findAll();

            expect(model.find).toHaveBeenCalled();
            expect(result).toEqual(mockBookings.map(booking => ({
                id: booking._id.toString(),
                userId: booking.userId.toString(),
                cabinId: booking.cabinId.toString(),
                startDate: booking.startDate.toISOString(),
                endDate: booking.endDate.toISOString(),
                status: booking.status,
                notes: booking.notes,
            })));
        });
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
            mockCabinsService.findById.mockResolvedValue({ isAvailable: true });
            mockBookingModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            mockBookingModel.create.mockResolvedValue(mockBooking);

            const result = await service.create(userId, createBookingDto);

            expect(cabinsService.findById).toHaveBeenCalledWith(createBookingDto.cabinId);
            expect(model.create).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it('should throw BadRequestException when cabin is not available', async () => {
            const userId = new Types.ObjectId().toString();
            mockCabinsService.findById.mockResolvedValue({ isAvailable: false });

            await expect(service.create(userId, createBookingDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException when there is a booking conflict', async () => {
            const userId = new Types.ObjectId().toString();
            mockCabinsService.findById.mockResolvedValue({ isAvailable: true });
            mockBookingModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockBooking),
            });

            await expect(service.create(userId, createBookingDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('findByUser', () => {
        it('should return user bookings', async () => {
            const userId = new Types.ObjectId().toString();
            const mockBookings = [mockBooking];
            mockBookingModel.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockBookings),
            });

            const result = await service.findByUser(userId);

            expect(model.find).toHaveBeenCalledWith({ userId: new Types.ObjectId(userId) });
            expect(result).toBeDefined();
        });

        it('should throw BadRequestException for invalid userId', async () => {
            await expect(service.findByUser('invalid-id')).rejects.toThrow(BadRequestException);
        });
    });

    describe('findById', () => {
        it('should return booking by id', async () => {
            const bookingId = new Types.ObjectId().toString();
            mockBookingModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockBooking),
            });

            const result = await service.findById(bookingId);

            expect(model.findById).toHaveBeenCalledWith(bookingId);
            expect(result).toBeDefined();
        });

        it('should throw NotFoundException when booking not found', async () => {
            const bookingId = new Types.ObjectId().toString();
            mockBookingModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(service.findById(bookingId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        const updateBookingDto: UpdateBookingDto = {
            notes: 'Updated notes'
        };

        it('should update booking successfully', async () => {
            const bookingId = new Types.ObjectId().toString();
            mockBookingModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ ...mockBooking, notes: 'Updated notes' }),
            });

            const result = await service.update(bookingId, updateBookingDto);

            expect(model.findByIdAndUpdate).toHaveBeenCalledWith(bookingId, updateBookingDto, { new: true });
            expect(result).toBeDefined();
            expect(result.notes).toBe('Updated notes');
        });

        it('should throw NotFoundException when booking not found', async () => {
            const bookingId = new Types.ObjectId().toString();
            mockBookingModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(service.update(bookingId, updateBookingDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException for invalid booking id', async () => {
            await expect(service.update('invalid-id', updateBookingDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('cancel', () => {
        it('should cancel booking successfully', async () => {
            const bookingId = new Types.ObjectId().toString();
            const userId = new Types.ObjectId().toString();
            const cancelledBooking = {
                ...mockBooking,
                status: BookingStatus.CANCELLED
            };

            mockBookingModel.findOne.mockReturnValue({
                save: jest.fn().mockResolvedValue(cancelledBooking),
            });

            const result = await service.cancel(bookingId, userId);

            expect(result).toBeDefined();
            expect(result.status).toBe(BookingStatus.CANCELLED);
        });

        it('should throw NotFoundException when booking not found', async () => {
            const bookingId = new Types.ObjectId().toString();
            const userId = new Types.ObjectId().toString();
            mockBookingModel.findOne.mockReturnValue(null);

            await expect(service.cancel(bookingId, userId)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException for invalid ids', async () => {
            await expect(service.cancel('invalid-id', 'invalid-user-id')).rejects.toThrow(BadRequestException);
        });
    });

    describe('confirmBooking', () => {
        it('should confirm booking successfully', async () => {
            const bookingId = new Types.ObjectId().toString();
            const confirmedBooking = {
                ...mockBooking,
                status: BookingStatus.CONFIRMED,
                save: jest.fn().mockResolvedValue({ ...mockBooking, status: BookingStatus.CONFIRMED }),
            };

            mockBookingModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(confirmedBooking),
            });

            const result = await service.confirmBooking(bookingId);

            expect(result).toBeDefined();
            expect(result.status).toBe(BookingStatus.CONFIRMED);
        });

        it('should throw NotFoundException when booking not found', async () => {
            const bookingId = new Types.ObjectId().toString();
            mockBookingModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(service.confirmBooking(bookingId)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException for invalid booking id', async () => {
            await expect(service.confirmBooking('invalid-id')).rejects.toThrow(BadRequestException);
        });
    });
});
