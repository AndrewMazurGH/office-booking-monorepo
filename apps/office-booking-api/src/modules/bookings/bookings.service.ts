import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from '../../shared/schemas/booking.schema';
import { CreateBookingDto } from '../../shared/dto/create-booking.dto';
import { UpdateBookingDto } from '../../shared/dto/update-booking.dto';
import { Booking as BookingType, BookingStatus } from '@office-booking-monorepo/types';
import { CabinsService } from '../cabins/cabins.service';


@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private readonly cabinsService: CabinsService,
  ) { }

  async findAll(): Promise<BookingType[]> {
    const docs = await this.bookingModel.find().exec();
    return docs.map(this.mapBookingToDTO);
  }

  async create(
    userId: string,
    createBookingDto: CreateBookingDto,
  ): Promise<BookingDocument> {
    try {
      console.log('Creating booking with data:', {
        userId,
        ...createBookingDto
      });

      // Validate ObjectIds
      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(createBookingDto.cabinId)) {
        console.log('Invalid ID format:', {
          userId,
          cabinId: createBookingDto.cabinId,
          isValidUserId: Types.ObjectId.isValid(userId),
          isValidCabinId: Types.ObjectId.isValid(createBookingDto.cabinId)
        });
        throw new BadRequestException('Invalid userId or cabinId format');
      }

      const userObjectId = new Types.ObjectId(userId);
      const cabinObjectId = new Types.ObjectId(createBookingDto.cabinId);

      console.log('Looking up cabin:', createBookingDto.cabinId);
      const cabin = await this.cabinsService.findById(createBookingDto.cabinId);
      console.log('Found cabin:', cabin);

      if (!cabin || !cabin.isAvailable) {
        throw new BadRequestException('Cabin is not available');
      }

      // Check for booking conflicts
      console.log('Checking for conflicts with:', {
        startDate: createBookingDto.startDate,
        endDate: createBookingDto.endDate
      });

      const conflictingBooking = await this.bookingModel
        .findOne({
          cabinId: cabinObjectId,
          status: { $ne: BookingStatus.CANCELLED },
          $or: [
            {
              startDate: { $lt: createBookingDto.endDate },
              endDate: { $gt: createBookingDto.startDate },
            },
          ],
        })
        .exec();

      if (conflictingBooking) {
        console.log('Found conflicting booking:', conflictingBooking);
        throw new BadRequestException('Cabin is already booked for this time period');
      }

      // Create new booking
      console.log('Creating new booking with:', {
        userId: userObjectId,
        cabinId: cabinObjectId,
        startDate: createBookingDto.startDate,
        endDate: createBookingDto.endDate
      });

      const booking = await this.bookingModel.create({
        userId: userObjectId,
        cabinId: cabinObjectId,
        startDate: createBookingDto.startDate,
        endDate: createBookingDto.endDate,
        notes: createBookingDto.notes,
        status: BookingStatus.PENDING,
      });

      return booking;
    } catch (error) {
      console.error('Error in create booking:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.name === 'BSONError' || error.name === 'CastError') {
        throw new BadRequestException('Invalid ID format provided');
      }
      throw error;
    }
  }

  async findByUser(userId: string): Promise<BookingType[]> {
    try {
      console.log('findByUser called with userId:', userId);
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid userId format');
      }

      const userObjectId = new Types.ObjectId(userId);
      const bookings = await this.bookingModel
        .find({ userId: userObjectId })
        .populate('cabinId', 'name capacity')
        .sort({ startDate: -1 })
        .exec();

      console.log('Bookings found:', bookings)
      return bookings.map(this.mapBookingToDTO);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user bookings');
    }
  }

  async findById(id: string): Promise<BookingType> {
    try {
      console.log('findById called with:', id);

      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid booking id format');
      }

      const booking = await this.bookingModel
        .findById(id)
        .populate('userId', 'email')
        .populate('cabinId', 'name capacity')
        .exec();

      console.log('Found booking:', booking);

      if (!booking) {
        throw new NotFoundException(`Booking #${id} not found`);
      }

      const mappedBooking = this.mapBookingToDTO(booking);
      console.log('Mapped booking:', mappedBooking);

      return mappedBooking;
    } catch (error) {
      console.error('Error in findById:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch booking');
    }
  }

  async confirmBooking(bookingId: string): Promise<BookingType> {
    try {
      if (!Types.ObjectId.isValid(bookingId)) {
        throw new BadRequestException('Invalid booking id format');
      }

      const booking = await this.bookingModel.findById(bookingId).exec();
      if (!booking) {
        throw new NotFoundException(`Booking #${bookingId} not found`);
      }

      booking.status = BookingStatus.CONFIRMED;
      await booking.save();

      return this.mapBookingToDTO(booking);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to confirm booking');
    }
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<BookingType> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid booking id format');
      }

      const booking = await this.bookingModel
        .findByIdAndUpdate(id, updateBookingDto, { new: true })
        .exec();

      if (!booking) {
        throw new NotFoundException(`Booking #${id} not found`);
      }

      return this.mapBookingToDTO(booking);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update booking');
    }
  }

  async cancel(id: string, userId: string): Promise<BookingType> {
    try {
      if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid id format');
      }

      const booking = await this.bookingModel.findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      });

      if (!booking) {
        throw new NotFoundException(`Booking #${id} not found`);
      }

      booking.status = BookingStatus.CANCELLED;
      await booking.save();

      return this.mapBookingToDTO(booking);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to cancel booking');
    }
  }

  private mapBookingToDTO(doc: BookingDocument): BookingType {
    // Правильно отримуємо userId
    const userId = doc.userId instanceof Types.ObjectId
      ? doc.userId.toString()
      : (doc.userId as any)?._id?.toString();

    // Правильно отримуємо cabinId
    const cabinId = doc.cabinId instanceof Types.ObjectId
      ? doc.cabinId.toString()
      : (doc.cabinId as any)?._id?.toString();

    console.log('Mapping booking to DTO:', {
      id: doc._id.toString(),
      userId,
      cabinId,
      startDate: doc.startDate.toISOString(),
      endDate: doc.endDate.toISOString(),
      status: doc.status,
      notes: doc.notes || ''
    });

    return {
      id: doc._id.toString(),
      userId,
      cabinId,
      startDate: doc.startDate.toISOString(),
      endDate: doc.endDate.toISOString(),
      status: doc.status,
      notes: doc.notes || ''
    };
  }
}