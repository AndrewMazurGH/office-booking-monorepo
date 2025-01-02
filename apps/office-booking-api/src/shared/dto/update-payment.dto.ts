import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '../schemas/payment.schema';

export class UpdatePaymentDto {
    @ApiProperty({
        enum: PaymentStatus,
        example: PaymentStatus.PAID,
        description: 'Новий статус платежу',
        required: true
    })
    @IsEnum(PaymentStatus)
    status: PaymentStatus;

    @ApiProperty({
        example: 'TX123456789',
        description: 'ID транзакції від платіжної системи',
        required: false
    })
    @IsOptional()
    @IsString()
    transactionId?: string;
}