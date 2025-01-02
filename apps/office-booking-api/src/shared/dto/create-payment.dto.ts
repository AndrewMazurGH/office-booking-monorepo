import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { PaymentStatus } from '../schemas/payment.schema';

export class CreatePaymentDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID бронювання, за яке здійснюється оплата',
    })
    @IsNotEmpty()
    @IsString()
    bookingId: string;

    @ApiProperty({
        example: 100,
        description: 'Сума платежу',
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiProperty({
        example: 'USD',
        description: 'Валюта платежу',
        default: 'USD',
        required: false,
    })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiProperty({
        enum: PaymentStatus,
        example: PaymentStatus.PENDING,
        description: 'Статус платежу',
        required: false,
        default: PaymentStatus.PENDING,
    })
    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus;
}

export class PaymentResponseDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'Унікальний ідентифікатор платежу',
    })
    id: string;

    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID користувача, який здійснив платіж',
    })
    userId: string;

    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID бронювання',
    })
    bookingId: string;

    @ApiProperty({
        example: 100,
        description: 'Сума платежу',
    })
    amount: number;

    @ApiProperty({
        example: 'USD',
        description: 'Валюта платежу',
    })
    currency: string;

    @ApiProperty({
        enum: PaymentStatus,
        example: PaymentStatus.PAID,
        description: 'Поточний статус платежу',
    })
    status: PaymentStatus;

    @ApiProperty({
        example: 'TX123456789',
        description: 'ID транзакції від платіжної системи',
        required: false,
    })
    transactionId?: string;

    @ApiProperty({
        example: '2024-01-01T10:00:00Z',
        description: 'Дата створення платежу',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2024-01-01T10:00:00Z',
        description: 'Дата останнього оновлення платежу',
    })
    updatedAt: Date;
}
