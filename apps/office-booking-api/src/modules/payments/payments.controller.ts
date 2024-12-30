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
import { UsersService } from '../users/users.service'
import { CreatePaymentDto } from '../../shared/dto/create-payment.dto';
import { UpdatePaymentDto } from '../../shared/dto/update-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
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
    @ApiOperation({ summary: 'Створити новий платіж' })
    @ApiResponse({ status: 201, description: 'Payment successfully created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async createPayment(
        @User('id') userId: string,
        @Body() createPaymentDto: CreatePaymentDto,
    ) {
        return this.paymentsService.createPayment(userId, createPaymentDto);
    }

    @Get('my-payments')
    @ApiOperation({ summary: 'Отримати всі платежі для поточного користувача' })
    @ApiResponse({ status: 200, description: 'Returns list of user payments' })
    async findMyPayments(@User('id') userId: string) {
        return this.paymentsService.findAll(userId);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Отримати всі платежі (тільки для адмінів)' })
    @ApiResponse({ status: 200, description: 'Returns list of all payments' })
    @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
    async findAll() {
        return this.paymentsService.findAll();
    }

    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Отримати платіж за ID' })
    @ApiResponse({ status: 200, description: 'Returns payment details' })
    @ApiResponse({ status: 404, description: 'Payment not found' })
    async getPayment(@Param('id') id: string, @User('id') userId: string) {
        const payment = await this.paymentsService.findById(id);

        if (payment.userId.toString() !== userId && !(await this.isAdminOrManager(userId))) {
            throw new ForbiddenException('You do not have permission to view this payment');
        }
        return payment;
    }


    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Оновлення статусу платежу (тільки для адмінів)' })
    @ApiResponse({ status: 200, description: 'Payment successfully updated' })
    @ApiResponse({ status: 404, description: 'Payment not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
    async updatePayment(
        @Param('id') id: string,
        @Body() updatePaymentDto: UpdatePaymentDto,
    ) {
        return this.paymentsService.updatePayment(id, updatePaymentDto);
    }

    private async isAdminOrManager(userId: string): Promise<boolean> {
        return this.usersService.hasRole(userId, [UserRole.ADMIN, UserRole.MANAGER]);
    }
}
