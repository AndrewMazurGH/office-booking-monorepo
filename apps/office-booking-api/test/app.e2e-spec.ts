import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthService } from '../src/modules/auth/auth.service';
import { UsersService } from '../src/modules/users/users.service';
import { UserRole } from '../src/shared/utils/user-role.enum';
import { CreateUserDto } from '../src/shared/dto/create-user.dto';
import { CabinsService } from '../src/modules/cabins/cabins.service';
import { describe, beforeAll, afterAll, beforeEach, it, expect } from '@jest/globals';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let mongoServer: MongoMemoryServer;
    let authService: AuthService;
    let usersService: UsersService;
    let cabinsService: CabinsService;
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
        // Create in-memory MongoDB instance
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoUri,
                    }),
                }),
                AppModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();

        // Apply global pipes and filters
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
            }),
        );
        app.useGlobalFilters(new HttpExceptionFilter());

        await app.init();

        // Get service instances
        authService = moduleFixture.get<AuthService>(AuthService);
        usersService = moduleFixture.get<UsersService>(UsersService);
        cabinsService = moduleFixture.get<CabinsService>(CabinsService);

        // Create test users with proper password lengths
        const adminUser: CreateUserDto = {
            email: 'admin@test.com',
            password: 'adminpass123', // Longer than 8 characters
            nickname: 'admin',
            phone: '+380501234567',
            firstName: 'Admin',
            lastName: 'User',
            role: UserRole.ADMIN,
        };

        const regularUser: CreateUserDto = {
            email: 'user@test.com',
            password: 'userpass123', // Longer than 8 characters
            nickname: 'user',
            phone: '+380507654321',
            firstName: 'Regular',
            lastName: 'User',
            role: UserRole.USER,
        };

        await usersService.createUser(adminUser);
        await usersService.createUser(regularUser);

        // Get tokens
        const adminAuth = await authService.validateUser('admin@test.com', 'adminpass123');
        const userAuth = await authService.validateUser('user@test.com', 'userpass123');

        const adminLogin = await authService.login(adminAuth);
        const userLogin = await authService.login(userAuth);

        adminToken = adminLogin.access_token;
        userToken = userLogin.access_token;
    });

    afterAll(async () => {
        await app.close();
        await mongoServer.stop();
    });

    // Auth Module Tests
    describe('AuthController (e2e)', () => {
        it('/api/auth/login (POST) - should login successfully', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ email: 'admin@test.com', password: 'adminpass123' })
                .expect(201)
                .expect(res => {
                    expect(res.body).toHaveProperty('access_token');
                    expect(res.body).toHaveProperty('refresh_token');
                });
        });

        it('/api/auth/login (POST) - should fail with invalid credentials', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({ email: 'wrong@test.com', password: 'wrongpass123' })
                .expect(401);
        });
    });

    // Users Module Tests
    describe('UsersController (e2e)', () => {
        it('/api/users/register (POST) - should create new user', () => {
            const newUser = {
                email: 'newuser@test.com',
                password: 'newuserpass123', // Longer than 8 characters
                nickname: 'newuser',
                phone: '+380509876543',
                firstName: 'New',
                lastName: 'User',
            };

            return request(app.getHttpServer())
                .post('/api/users/register')
                .send(newUser)
                .expect(201)
                .expect(res => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.email).toBe(newUser.email);
                });
        });

        it('/api/users/me (GET) - should get current user info', () => {
            return request(app.getHttpServer())
                .get('/api/users/me')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200)
                .expect(res => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.email).toBe('user@test.com');
                });
        });
    });

    // Bookings Module Tests
    describe('BookingsController (e2e)', () => {
        let cabinId: string;
        let bookingId: string;

        beforeEach(async () => {
            // Create a test cabin using the service method
            const createdCabin = await cabinsService.createForTesting({
                name: 'Test Cabin',
                capacity: 4,
                description: 'Test cabin for bookings',
                isAvailable: true
            });
            cabinId = createdCabin.id;  // Use .id instead of ._id.toString()
        });

        it('should create a new booking', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    cabinId: cabinId,
                    startDate: new Date(Date.now() + 86400000).toISOString(),
                    endDate: new Date(Date.now() + 172800000).toISOString(),
                    notes: 'Test booking',
                })
                .expect(201);

            bookingId = response.body.id;
            expect(response.body).toHaveProperty('status', 'pending');
        });

        it('should get user bookings', () => {
            return request(app.getHttpServer())
                .get('/api/bookings/my-bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200)
                .expect(res => {
                    expect(Array.isArray(res.body)).toBeTruthy();
                });
        });

        it('should update booking', async () => {
            // Спочатку створюємо бронювання
            const createResponse = await request(app.getHttpServer())
                .post('/api/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    cabinId: cabinId,
                    startDate: new Date(Date.now() + 86400000).toISOString(), // + 1 день
                    endDate: new Date(Date.now() + 172800000).toISOString(),  // + 2 дні
                    notes: 'Test booking',
                });

            expect(createResponse.status).toBe(201);

            // Потім оновлюємо його з повними даними
            return request(app.getHttpServer())
                .put(`/api/bookings/${createResponse.body.id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    cabinId: cabinId,
                    startDate: new Date(Date.now() + 86400000).toISOString(),
                    endDate: new Date(Date.now() + 172800000).toISOString(),
                    notes: 'Updated test booking',
                    status: 'pending'
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.notes).toBe('Updated test booking');
                });
        });
    });

    // Payments Module Tests
    describe('PaymentsController (e2e)', () => {
        let cabinId: string;
        let bookingId: string;
        let paymentId: string;

        beforeEach(async () => {
            // Create test cabin using the service method
            const createdCabin = await cabinsService.createForTesting({
                name: 'Test Cabin',
                capacity: 4,
                description: 'Test cabin for payments',
                isAvailable: true
            });
            cabinId = createdCabin.id;

            // Create test booking
            const bookingResponse = await request(app.getHttpServer())
                .post('/api/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    cabinId: cabinId,
                    startDate: new Date(Date.now() + 86400000).toISOString(),
                    endDate: new Date(Date.now() + 172800000).toISOString(),
                    notes: 'Test booking for payment',
                });
            bookingId = bookingResponse.body.id;
        });

        it('should create a payment for booking', async () => {
            // Створюємо бронювання
            const bookingResponse = await request(app.getHttpServer())
                .post('/api/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    cabinId: cabinId,
                    startDate: new Date(Date.now() + 86400000).toISOString(),
                    endDate: new Date(Date.now() + 172800000).toISOString(),
                    notes: 'Test booking for payment',
                });

            expect(bookingResponse.status).toBe(201);

            // Перевіряємо що бронювання успішно створено
            const bookingId = bookingResponse.body.id;
            expect(bookingId).toBeDefined();

            // Створюємо платіж
            const response = await request(app.getHttpServer())
                .post('/api/payments')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    bookingId: bookingId,
                    amount: 100,
                    currency: 'USD',
                })
                .expect(201);

            const paymentId = response.body.id;
            expect(paymentId).toBeDefined();
            expect(response.body.status).toBe('PENDING');
        });

        it('should get user payments', () => {
            return request(app.getHttpServer())
                .get('/api/payments/my-payments')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200)
                .expect(res => {
                    expect(Array.isArray(res.body)).toBeTruthy();
                });
        });
    });
});