import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CabinsService } from './cabins.service';
import { CabinsController } from './cabins.controller';
import { Cabin, CabinSchema } from '../../shared/schemas/cabin.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Cabin.name, schema: CabinSchema }]),
    ],
    controllers: [CabinsController],
    providers: [CabinsService],
    exports: [CabinsService],
})
export class CabinsModule { }
