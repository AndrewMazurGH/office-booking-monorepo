import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { PaymentStatus } from '../schemas/payment.schema';

export class CreatePaymentDto {
    @IsNotEmpty()
    bookingId: string;  // bookingId у форматі рядка (потім конвертуємо у Types.ObjectId)

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus;
}
