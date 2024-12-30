import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cabin, CabinDocument } from '../../shared/schemas/cabin.schema';

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
        // Наприклад, повертати лише ті, що isAvailable = true
        return this.cabinModel.find({ isAvailable: true }).exec();
    }

    async findById(id: string) {
        return this.cabinModel.findById(id).exec();
    }

    // CRUD-методи за потребою: create(), update(), remove()...
}
