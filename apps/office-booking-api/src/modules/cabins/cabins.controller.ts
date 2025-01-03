import {
    Controller,
    Get,
    Param,
    UseGuards,
    Post,
    Body
} from '@nestjs/common';
import { CabinsService } from './cabins.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@office-booking-monorepo/types'; // Adjust import path if needed
import { CreateCabinDto } from '../../shared/dto/create-cabin.dto';

@ApiTags('Cabins')
@ApiBearerAuth('access-token')
@Controller('api/cabins')
@UseGuards(JwtAuthGuard)
export class CabinsController {
    constructor(private readonly cabinsService: CabinsService) { }

    @Get()
    async findAll() {
        return this.cabinsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.cabinsService.findById(id);
    }

    // ADD THIS:
    @Post('new')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.MANAGER) // only admin/manager can create cabins
    async createCabin(@Body() createCabinDto: CreateCabinDto) {
        console.log('Incoming cabinDto:', createCabinDto);
        return this.cabinsService.createCabin(createCabinDto);
    }
}
