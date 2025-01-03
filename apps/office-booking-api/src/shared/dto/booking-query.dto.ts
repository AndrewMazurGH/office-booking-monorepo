import { IsOptional, IsDate, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { BookingStatus } from '../interfaces/booking.interface';

export class BookingQueryDto {
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  startDate?: Date;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  endDate?: Date;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
