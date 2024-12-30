import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from '../../shared/dto/create-booking.dto';
import { UpdateBookingDto } from '../../shared/dto/update-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../common/decorators/user.decorator';
import { UserRole } from '../../shared/utils/user-role.enum';
import { Booking } from '@office-booking-monorepo/types';


@ApiTags('Bookings')
@ApiBearerAuth('access-token')
@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  /**
   * Створити бронювання
   * Доступно всім залогіненим користувачам
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Створити бронювання' })
  @ApiBody({
    description: 'Booking creation data',
    type: CreateBookingDto,
    examples: {
      booking: {
        value: {
          cabinId: '6567d123e4b5f6789abcdef0', // 
          startDate: '2024-01-01T09:00:00Z',
          endDate: '2024-01-01T10:00:00Z',
          notes: 'Бізнес зустріч'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully',
    type: CreateBookingDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input - check cabinId format and date validity'
  })
  async create(
    @User('id') userId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(userId, createBookingDto);
  }

  /**
   * Отримати список бронювань (усіх)
   * Доступно тільки ADMIN i MANAGER
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Отримати список усіх бронювань (ADMIN/MANAGER)' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Фільтр за статусом бронювання (необов’язково)',
  })
  @ApiResponse({ status: 200, description: 'Array of Bookings' })
  async getAll(): Promise<Booking[]> {
    return this.bookingsService.findAll();
  }

  /**
   * Отримати список власних бронювань
   * Доступно для авторизованого користувача
   */
  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Отримати список власних бронювань' })
  @ApiResponse({ status: 200, description: 'Array of user bookings' })
  async findMyBookings(@User('id') userId: string) {
    console.log('User ID from JWT:', userId);
    if (!userId) {
      throw new BadRequestException('User ID is missing from JWT');
    }
    return this.bookingsService.findByUser(userId);
  }

  /**
   * Отримати конкретне бронювання за ID
   * - ADMIN/MANAGER можуть бачити будь-яке
   * - Звичайний користувач — тільки своє
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Ідентифікатор бронювання',
    example: '63f5214c7c204cf2bccd5abc',
  })
  @ApiOperation({ summary: 'Отримати конкретне бронювання' })
  @ApiResponse({ status: 200, description: 'Booking found' })
  @ApiResponse({ status: 403, description: 'Forbidden for normal user' })
  async findOne(@Param('id') bookingId: string, @User('id') userId: string, @User('role') role: UserRole) {
    const booking = await this.bookingsService.findById(bookingId);

    if (!booking) {
      // Можете використати NotFoundException
      throw new ForbiddenException(`Booking #${bookingId} not found`);
    }

    // Якщо користувач - admin/manager, то повертаємо
    if ([UserRole.ADMIN, UserRole.MANAGER].includes(role)) {
      return booking;
    }

    // Якщо це не admin і не manager,
    // то перевіряємо, чи належить це бронювання userId
    if (booking.userId.toString() !== userId) {
      throw new ForbiddenException('You can view only your own bookings');
    }

    return booking;
  }

  /**
   * Оновити бронювання
   * - ADMIN/MANAGER можуть оновити будь-яке
   * - Звичайний користувач — тільки своє
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Оновити бронювання' })
  @ApiParam({
    name: 'id',
    description: 'ID бронювання',
  })
  @ApiResponse({ status: 200, description: 'Booking updated' })
  @ApiResponse({ status: 403, description: 'Forbidden for normal user' })
  async update(
    @Param('id') bookingId: string,
    @User('id') userId: string,
    @User('role') role: UserRole,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    const booking = await this.bookingsService.findById(bookingId);
    if (!booking) {
      throw new ForbiddenException(`Booking #${bookingId} not found`);
    }

    // Якщо admin/manager, оновлюємо одразу
    if ([UserRole.ADMIN, UserRole.MANAGER].includes(role)) {
      return this.bookingsService.update(bookingId, updateBookingDto);
    }

    // Якщо звичайний user, перевірити, чи належить це бронювання йому
    if (booking.userId.toString() !== userId) {
      throw new ForbiddenException('You can update only your own bookings');
    }

    return this.bookingsService.update(bookingId, updateBookingDto);
  }

  /**
   * Скасувати бронювання
   * - ADMIN/MANAGER можуть скасувати будь-яке
   * - Звичайний користувач — тільки своє
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Скасувати (видалити) бронювання' })
  @ApiParam({
    name: 'id',
    description: 'ID бронювання',
  })
  @ApiResponse({ status: 200, description: 'Booking canceled' })
  @ApiResponse({ status: 403, description: 'Forbidden for normal user' })
  async cancel(@Param('id') bookingId: string, @User('id') userId: string, @User('role') role: UserRole) {
    const booking = await this.bookingsService.findById(bookingId);
    if (!booking) {
      throw new ForbiddenException(`Booking #${bookingId} not found`);
    }

    // Якщо admin/manager, видаляємо
    if ([UserRole.ADMIN, UserRole.MANAGER].includes(role)) {
      return this.bookingsService.cancel(bookingId, userId);
    }

    // Якщо це звичайний user, перевіряємо власника
    if (booking.userId.toString() !== userId) {
      throw new ForbiddenException('You can delete only your own bookings');
    }

    return this.bookingsService.cancel(bookingId, userId);
  }
}
