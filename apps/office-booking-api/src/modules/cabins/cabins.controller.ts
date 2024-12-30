import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CabinsService } from './cabins.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

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
}
