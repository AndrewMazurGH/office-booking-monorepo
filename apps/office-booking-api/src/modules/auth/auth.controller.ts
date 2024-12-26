import { Controller, Post, UseGuards, Body, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { LoginResponse } from '../../shared/utils/auth.types';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
    user: {
        id: string;  // Changed from userId to id
        email: string;
        role?: string;
    };
}

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiOperation({ summary: 'Увійти з email і паролем' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'john.doe@example.com' },
                password: { type: 'string', example: 'secretPass123' },
            },
            required: ['email', 'password']
        },
    })
    async login(@Request() req: AuthenticatedRequest): Promise<LoginResponse> {
        return this.authService.login(req.user);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Оновити токен доступу' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                refresh_token: { type: 'string', example: 'your.refresh.token' },
            },
            required: ['refresh_token']
        },
    })
    async refresh(@Body() body: { refresh_token: string }): Promise<LoginResponse> {
        return this.authService.refreshToken(body.refresh_token);
    }
}