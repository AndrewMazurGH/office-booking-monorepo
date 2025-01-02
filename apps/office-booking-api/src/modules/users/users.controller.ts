import { Controller, Post, Body, Get, Param, UseGuards, Patch, Req } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserResponse } from '../../shared/utils/users.responce';
import { CreateUserDto } from '../../shared/dto/create-user.dto';
import { UserRole } from '../../shared/utils/user-role.enum';
import { User } from '../../common/decorators/user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Users Controller')
@Controller('api/users')
@ApiBearerAuth('access-token')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Returns all current user info' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getAllUsers(): Promise<UserResponse[]> {
        const users = await this.usersService.findAll();
        return users.map(user => UserResponse.fromDocument(user));
    }

    @Post('register')
    @ApiOperation({ summary: 'Зареєструвати нового користувача' })
    @ApiResponse({ status: 201, description: 'User successfully created' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiBody({
        description: 'Дані для створення користувача',
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'john.doe@example.com' },
                password: { type: 'string', example: 'securePassword123' },
                nickname: { type: 'string', example: 'johndoe' },
                phone: { type: 'string', example: '+380501234567' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' }
            },
            required: ['email', 'password', 'nickname', 'phone', 'firstName', 'lastName']
        },
    })
    async register(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
        return this.usersService.createUser(createUserDto);
    }

    @Get('email/:email')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.MANAGER) // Allow both admin and manager to access
    @ApiOperation({ summary: 'Отримати ID користувача через email' })
    @ApiResponse({ status: 200, description: 'User found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiParam({
        name: 'email',
        description: 'User email address',
        example: 'john.doe@example.com',
    })
    async getUserByEmail(@Param('email') email: string): Promise<UserResponse> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }
        return user;
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current user information' })
    @ApiResponse({ status: 200, description: 'Returns current user info' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getMe(@User('id') userId: string): Promise<UserResponse> {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }


    // @Get('me')
    // @UseGuards(JwtAuthGuard)
    // @ApiOperation({ summary: 'Отримати інформацію про поточного користувача' })
    // @ApiResponse({ status: 200, description: 'User found' })
    // @ApiResponse({ status: 401, description: 'Unauthorized' })
    // async getMe(@Req() req): Promise<UserResponse> {
    //     const userId = req.user?.id; // Отримуємо user ID з JWT
    //     if (!userId) {
    //         throw new NotFoundException('User not found');
    //     }
    //     return this.usersService.findById(userId);
    // }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    @ApiOperation({ summary: 'Отримати інформацію про користувача за його ID' })
    @ApiResponse({ status: 200, description: 'User found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiParam({
        name: 'id',
        description: 'Унікальний ідентифікатор користувача',
        example: '64a9bc7c1234abcd5678ef90',
    })
    async getUserById(@Param('id') id: string): Promise<UserResponse> {
        return this.usersService.findById(id);
    }

    @Patch(':id/role')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) // Only admin can change roles
    @ApiOperation({ summary: 'Оновити роль користувача' })
    @ApiResponse({ status: 200, description: 'Role updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Only admin can perform this action' })
    @ApiParam({
        name: 'id',
        description: 'Унікальний ідентифікатор користувача',
        example: '64a9bc7c1234abcd5678ef90',
    })
    @ApiBody({
        description: 'Нова роль для користувача',
        schema: {
            type: 'object',
            properties: {
                role: {
                    type: 'string',
                    enum: Object.values(UserRole),
                    example: UserRole.ADMIN,
                },
            },
            required: ['role']
        },
    })
    async updateUserRole(@Param('id') userId: string, @Body('role') newRole: UserRole) {
        return this.usersService.updateRole(userId, newRole);
    }
}