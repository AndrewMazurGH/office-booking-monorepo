import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../shared/schemas/user.schema';
import { CreateUserDto } from '../../shared/dto/create-user.dto';
import { UserRole } from '../../shared/utils/user-role.enum';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn(() => 'hashedPassword'),
    compare: jest.fn(() => true),
}));

describe('UsersService', () => {
    let service: UsersService;
    let model: Model<UserDocument>;

    const mockUser = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: UserRole.USER,
        nickname: 'testuser',
        phone: '+380501234567',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
    };

    const mockUserModel = {
        create: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        exec: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        model = module.get<Model<UserDocument>>(getModelToken(User.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createUser', () => {
        const createUserDto: CreateUserDto = {
            email: 'test@example.com',
            password: 'password123',
            nickname: 'testuser',
            phone: '+380501234567',
            firstName: 'Test',
            lastName: 'User',
        };

        it('should successfully create a user', async () => {
            mockUserModel.findOne.mockReturnValue({ exec: () => null });
            mockUserModel.create.mockResolvedValue(mockUser);

            const result = await service.createUser(createUserDto);

            expect(result).toBeDefined();
            expect(result.email).toBe(createUserDto.email);
            expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
        });

        it('should throw ConflictException if user already exists', async () => {
            mockUserModel.findOne.mockReturnValue({ exec: () => mockUser });

            await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictException);
        });

        it('should throw BadRequestException if password is too short', async () => {
            await expect(
                service.createUser({ ...createUserDto, password: '123' })
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('findById', () => {
        it('should return a user if found', async () => {
            mockUserModel.findById.mockImplementation(() => ({
                exec: () => mockUser,
            }));

            const result = await service.findById(mockUser._id.toString());

            expect(result).toBeDefined();
            expect(result.email).toBe(mockUser.email);
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUserModel.findById.mockImplementation(() => ({
                exec: () => null,
            }));

            await expect(
                service.findById('507f1f77bcf86cd799439011')
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByEmail', () => {
        it('should return a user if found', async () => {
            mockUserModel.findOne.mockImplementation(() => ({
                exec: () => mockUser,
            }));

            const result = await service.findByEmail('test@example.com');

            expect(result).toBeDefined();
            expect(result.email).toBe(mockUser.email);
        });

        it('should return null if user not found', async () => {
            mockUserModel.findOne.mockImplementation(() => ({
                exec: () => null,
            }));

            const result = await service.findByEmail('nonexistent@example.com');
            expect(result).toBeNull();
        });
    });

    describe('updateRole', () => {
        it('should successfully update user role', async () => {
            const updatedUser = { ...mockUser, role: UserRole.ADMIN, save: jest.fn() };
            mockUserModel.findById.mockResolvedValue(updatedUser);

            const result = await service.updateRole(
                mockUser._id.toString(),
                UserRole.ADMIN
            );

            expect(result).toBeDefined();
            expect(result.role).toBe(UserRole.ADMIN);
            expect(updatedUser.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUserModel.findById.mockResolvedValue(null);

            await expect(
                service.updateRole('507f1f77bcf86cd799439011', UserRole.ADMIN)
            ).rejects.toThrow(NotFoundException);
        });
    });
});