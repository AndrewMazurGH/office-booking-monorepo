import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    UseGuards,
    ForbiddenException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UsersService } from '../users/users.service';
import { CreatePaymentDto, PaymentResponseDto } from '../../shared/dto/create-payment.dto';
import { UpdatePaymentDto } from '../../shared/dto/update-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
    ApiParam,
    ApiBody
} from '@nestjs/swagger';
import { UserRole } from '../../shared/utils/user-role.enum';

@ApiTags('Payments')
@Controller('api/payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly usersService: UsersService,
    ) { }

    @Post()
    @ApiOperation({
        summary: 'Створити новий платіж',
        description: 'Створює новий платіж для конкретного бронювання'
    })
    @ApiBody({
        type: CreatePaymentDto,
        description: 'Дані для створення платежу',
        examples: {
            example1: {
                value: {
                    bookingId: '507f1f77bcf86cd799439011',
                    amount: 100,
                    currency: 'USD'
                },
                summary: 'Basic Payment Creation'
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Платіж успішно створено',
        type: PaymentResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Неправильний запит - перевірте формат даних'
    })
    @ApiResponse({
        status: 401,
        description: 'Неавторизований доступ'
    })
    async createPayment(
        @User('id') userId: string,
        @Body() createPaymentDto: CreatePaymentDto,
    ): Promise<PaymentResponseDto> {
        return this.paymentsService.createPayment(userId, createPaymentDto);
    }

    @Get('my-payments')
    @ApiOperation({
        summary: 'Отримати власні платежі',
        description: 'Повертає список всіх платежів поточного користувача'
    })
    @ApiResponse({
        status: 200,
        description: 'Список платежів користувача',
        type: [PaymentResponseDto]
    })
    @ApiResponse({
        status: 401,
        description: 'Неавторизований доступ'
    })
    async findMyPayments(@User('id') userId: string): Promise<PaymentResponseDto[]> {
        return this.paymentsService.findAll(userId);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Отримати всі платежі [ADMIN]',
        description: 'Повертає список всіх платежів у системі (тільки для адміністраторів)'
    })
    @ApiResponse({
        status: 200,
        description: 'Список всіх платежів',
        type: [PaymentResponseDto]
    })
    @ApiResponse({
        status: 401,
        description: 'Неавторизований доступ'
    })
    @ApiResponse({
        status: 403,
        description: 'Заборонено - потрібні права адміністратора'
    })
    async findAll(): Promise<PaymentResponseDto[]> {
        return this.paymentsService.findAll();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Отримати платіж за ID',
        description: 'Повертає інформацію про конкретний платіж'
    })
    @ApiParam({
        name: 'id',
        description: 'ID платежу',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiResponse({
        status: 200,
        description: 'Інформація про платіж',
        type: PaymentResponseDto
    })
    @ApiResponse({
        status: 404,
        description: 'Платіж не знайдено'
    })
    async getPayment(
        @Param('id') id: string,
        @User('id') userId: string,
        @User('role') userRole: string
    ): Promise<PaymentResponseDto> {
        const payment = await this.paymentsService.findPaymentById(id);
        if (payment.userId.toString() !== userId && !(await this.isAdminOrManager(userId))) {
            throw new ForbiddenException('У вас немає прав для перегляду цього платежу');
        }
        return payment;
    }

    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Оновити статус платежу [ADMIN]',
        description: 'Оновлює статус існуючого платежу (тільки для адміністраторів)'
    })
    @ApiParam({
        name: 'id',
        description: 'ID платежу',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiBody({
        type: UpdatePaymentDto,
        description: 'Дані для оновлення платежу'
    })
    @ApiResponse({
        status: 200,
        description: 'Платіж успішно оновлено',
        type: PaymentResponseDto
    })
    @ApiResponse({
        status: 403,
        description: 'Заборонено - потрібні права адміністратора'
    })
    @ApiResponse({
        status: 404,
        description: 'Платіж не знайдено'
    })
    async updatePayment(
        @Param('id') id: string,
        @Body() updatePaymentDto: UpdatePaymentDto,
    ): Promise<PaymentResponseDto> {
        return this.paymentsService.updatePayment(id, updatePaymentDto);
    }

    private async isAdminOrManager(userId: string): Promise<boolean> {
        return this.usersService.hasRole(userId, [UserRole.ADMIN, UserRole.MANAGER]);
    }
}