import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking, BookingSchema } from '../../shared/schemas/booking.schema';
import { CabinsModule } from '../cabins/cabins.module';
@Module({
  imports: [
    // якщо використовуємо Mongoose + MongoDB
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    CabinsModule
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule { }
