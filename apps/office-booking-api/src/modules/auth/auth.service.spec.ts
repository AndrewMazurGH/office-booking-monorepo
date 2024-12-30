import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;

    const mockUsersService = {
        findByEmail: jest.fn(),
        findUserDocument: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
        verifyAsync: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should throw UnauthorizedException when user not found', async () => {
            mockUsersService.findByEmail.mockResolvedValueOnce(null);

            await expect(service.validateUser('test@test.com', 'password'))
                .rejects
                .toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when password invalid', async () => {
            mockUsersService.findByEmail.mockResolvedValueOnce({
                id: '1',
                email: 'test@test.com',
            });
            mockUsersService.findUserDocument.mockResolvedValueOnce({
                passwordHash: 'hashedPassword',
            });

            await expect(service.validateUser('test@test.com', 'wrongpassword'))
                .rejects
                .toThrow(UnauthorizedException);
        });
    });
});