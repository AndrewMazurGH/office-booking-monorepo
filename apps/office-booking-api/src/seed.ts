import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { UserRole } from './shared/utils/user-role.enum';
import { CreateUserDto } from './shared/dto/create-user.dto';

async function bootstrap() {
    try {
        const app = await NestFactory.createApplicationContext(AppModule);
        const usersService = app.get(UsersService);

        // Create admin user
        const adminUser: CreateUserDto = {
            email: 'admin@example.com',
            password: 'admin123',
            nickname: 'admin',
            phone: '+380501234567',
            firstName: 'Admin',
            lastName: 'User',
            role: UserRole.ADMIN
        };

        await usersService.createUser(adminUser);
        console.log('Admin user created successfully');

        // Create regular user
        const regularUser: CreateUserDto = {
            email: 'user@example.com',
            password: 'user123',
            nickname: 'user',
            phone: '+380507654321',
            firstName: 'Regular',
            lastName: 'User',
            role: UserRole.USER
        };

        await usersService.createUser(regularUser);
        console.log('Regular user created successfully');

        await app.close();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error during the seeding process:', error.message);
        } else {
            console.error('Unknown error during the seeding process');
        }
        process.exit(1);
    }
}

bootstrap();