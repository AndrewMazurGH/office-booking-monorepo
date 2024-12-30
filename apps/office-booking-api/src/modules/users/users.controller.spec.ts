import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from '../../shared/dto/create-user.dto';
import { UserRole } from '../../shared/utils/user-role.enum';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    const mockUser = {
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: UserRole.USER,
        createdAt: new Date(),
    };

    const mockUsersService = {
        createUser: jest.fn(),
        findByEmail: jest.fn(),
        findById: jest.fn(),
        updateRole: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        const createUserDto: CreateUserDto = {
            email: 'test@example.com',
            password: 'password123',
            nickname: 'testuser',
            phone: '+380501234567',
            firstName: 'Test',
            lastName: 'User',
        };

        it('should successfully register a new user', async () => {
            mockUsersService.createUser.mockResolvedValue(mockUser);

            const result = await controller.register(createUserDto);

            expect(result).toBeDefined();
            expect(result.email).toBe(createUserDto.email);
            expect(service.createUser).toHaveBeenCalledWith(createUserDto);
        });
    });

    describe('getUserByEmail', () => {
        it('should return a user if found', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);

            const result = await controller.getUserByEmail('test@example.com');

            expect(result).toBeDefined();
            expect(result.email).toBe(mockUser.email);
            expect(service.findByEmail).toHaveBeenCalledWith('test@example.com');
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);

            await expect(
                controller.getUserByEmail('nonexistent@example.com')
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('getMe', () => {
        it('should return current user information', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);

            const result = await controller.getMe(mockUser.id);

            expect(result).toBeDefined();
            expect(result.email).toBe(mockUser.email);
            expect(service.findById).toHaveBeenCalledWith(mockUser.id);
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUsersService.findById.mockResolvedValue(null);

            await expect(controller.getMe('nonexistent-id')).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('getUserById', () => {
        it('should return user if found', async () => {
            mockUsersService.findById.mockResolvedValue(mockUser);

            const result = await controller.getUserById(mockUser.id);

            expect(result).toBeDefined();
            expect(result.email).toBe(mockUser.email);
            expect(service.findById).toHaveBeenCalledWith(mockUser.id);
        });
    });

    describe('updateUserRole', () => {
        it('should successfully update user role', async () => {
            const updatedUser = { ...mockUser, role: UserRole.ADMIN };
            mockUsersService.updateRole.mockResolvedValue(updatedUser);

            const result = await controller.updateUserRole(mockUser.id, UserRole.ADMIN);

            expect(result).toBeDefined();
            expect(result.role).toBe(UserRole.ADMIN);
            expect(service.updateRole).toHaveBeenCalledWith(mockUser.id, UserRole.ADMIN);
        });
    });
});