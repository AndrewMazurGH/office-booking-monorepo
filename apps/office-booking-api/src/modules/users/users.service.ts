import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../shared/schemas/user.schema';
import { UserResponse } from '../../shared/utils/users.responce';
// import { UserRole } from '../../shared/utils/user-role.enum';
import { CreateUserDto } from '../../shared/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@office-booking-monorepo/types';

@Injectable()
export class UsersService {
    async updateRole(userId: string, newRole: UserRole): Promise<UserResponse> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.role = newRole;
        await user.save();
        return UserResponse.fromDocument(user);
    }
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async findUserDocument(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async createUser(createUserDto: CreateUserDto): Promise<UserResponse> {
        // Password validation
        if (createUserDto.password.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters');
        }

        // Email validation
        if (!createUserDto.email || !createUserDto.email.includes('@')) {
            throw new BadRequestException('Invalid email format');
        }

        // Check for existing user
        const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        // Hash password and create user
        const passwordHash = await bcrypt.hash(createUserDto.password, 10);

        const user = await this.userModel.create({
            email: createUserDto.email,
            passwordHash,
            nickname: createUserDto.nickname,
            phone: createUserDto.phone,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            role: createUserDto.role || UserRole.USER
        });
        return UserResponse.fromDocument(user);
    }

    async findById(id: string): Promise<UserResponse> {
        // Add logging to debug
        console.log('Searching for user with ID:', id);

        try {
            // Convert string ID to ObjectId
            const objectId = new Types.ObjectId(id);
            const user = await this.userModel.findById(objectId).exec();

            console.log('Found user:', user);  // Debug log

            if (!user) {
                throw new NotFoundException(`User #${id} not found`);
            }

            return {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            };
        } catch (error) {
            console.error('Error finding user:', error);  // Debug log
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new NotFoundException(`User #${id} not found`);
        }
    }

    async findByEmail(email: string): Promise<UserResponse | null> {
        const user = await this.userModel.findOne({ email }).exec();
        return user ? UserResponse.fromDocument(user) : null;
    }

    async hasRole(userId: string, roles: UserRole[]): Promise<boolean> {
        const user = await this.findById(userId);
        return user ? roles.includes(user.role as UserRole) : false;
    }

    async findAll(): Promise<User[]> {
        const users = await this.userModel.find().exec();
        return users.map(user => ({
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || '',
            role: user.role || UserRole.USER
        }));
    }
}
