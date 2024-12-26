import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty({
    example: 'cabin-id-123',
    description: 'ID кабінки, яку потрібно забронювати',
  })
  @IsNotEmpty()
  @IsString()
  cabinId: string;

  @ApiProperty({
    example: '2024-01-01T09:00:00Z',
    description: 'Дата і час початку бронювання у форматі ISO 8601',
  })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty({
    example: '2024-01-01T10:00:00Z',
    description: 'Дата і час завершення бронювання у форматі ISO 8601',
  })
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @ApiProperty({
    example: 'Бронювання для ділової зустрічі',
    description: 'Додаткові примітки до бронювання',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
