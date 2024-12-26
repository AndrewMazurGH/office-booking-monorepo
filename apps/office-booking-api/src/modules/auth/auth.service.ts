import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtPayload, LoginResponse } from '../../shared/utils/auth.types';
import { UserResponse } from '../../shared/utils/users.responce';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const userDoc = await this.usersService.findUserDocument(email);
        if (!userDoc || !userDoc.passwordHash) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, userDoc.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    async login(user: UserResponse): Promise<LoginResponse> {
        const payload: JwtPayload = {
            id: user.id,
            email: user.email,
            role: user.role || 'user',
        };

        return {
            access_token: this.jwtService.sign(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1h'
            }),
            refresh_token: this.jwtService.sign(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: '7d'
            })
        };
    }

    async refreshToken(refresh_token: string): Promise<LoginResponse> {
        try {
            const payload = await this.jwtService.verifyAsync(refresh_token, {
                secret: this.configService.get<string>('JWT_SECRET')
            });

            const user = await this.usersService.findById(payload.id);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const newPayload: JwtPayload = {
                id: user.id,
                email: user.email,
                role: user.role || 'user',
            };

            return {
                access_token: this.jwtService.sign(newPayload, {
                    secret: this.configService.get<string>('JWT_SECRET'),
                    expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1h'
                }),
                refresh_token: this.jwtService.sign(newPayload, {
                    secret: this.configService.get<string>('JWT_SECRET'),
                    expiresIn: '7d'
                })
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }
}