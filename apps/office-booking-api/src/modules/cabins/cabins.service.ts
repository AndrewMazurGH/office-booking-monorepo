import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cabin, CabinDocument } from '../../shared/schemas/cabin.schema';
// import the DTO if you put it in a separate file
import { CreateCabinDto } from '../../shared/dto/create-cabin.dto';

@Injectable()
export class CabinsService {
    constructor(
        @InjectModel(Cabin.name) private cabinModel: Model<CabinDocument>
    ) { }

    async createForTesting(data: {
        name: string;
        capacity: number;
        description: string;
        isAvailable: boolean;
    }): Promise<CabinDocument> {
        return this.cabinModel.create(data);
    }

    async findAll() {
        const cabins = await this.cabinModel.find({ isAvailable: true }).exec();
        return cabins.map(cabin => ({
            id: cabin._id.toString(),
            name: cabin.name,
            capacity: cabin.capacity,
            isAvailable: cabin.isAvailable
        }));
    }

    async findById(id: string) {
        return this.cabinModel.findById(id).exec();
    }

    // ADD THIS METHOD:
    async createCabin(dto: CreateCabinDto): Promise<CabinDocument> {
        // Optionally default `isAvailable` to true if not provided
        if (dto.isAvailable === undefined) {
            dto.isAvailable = true;
        }
        // location, description, etc. can be set from dto as well
        return this.cabinModel.create({
            name: dto.name,
            capacity: dto.capacity,
            description: dto.description,
            isAvailable: dto.isAvailable,
            // optional fields:
            // location: dto.location
        });
    }
}
