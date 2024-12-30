import { Test, TestingModule } from '@nestjs/testing';
import { CabinsController } from './cabins.controller';
import { CabinsService } from './cabins.service';
import { Cabin } from '../../shared/schemas/cabin.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('CabinsController', () => {
    let controller: CabinsController;
    let service: CabinsService;

    const mockCabin = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Cabin',
        capacity: 4,
        description: 'A test cabin',
        isAvailable: true,
    };

    const mockCabinsService = {
        findAll: jest.fn().mockResolvedValue([mockCabin]),
        findById: jest.fn().mockResolvedValue(mockCabin),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CabinsController],
            providers: [
                {
                    provide: CabinsService,
                    useValue: mockCabinsService,
                },
                {
                    provide: getModelToken(Cabin.name),
                    useValue: Model,
                },
            ],
        }).compile();

        controller = module.get<CabinsController>(CabinsController);
        service = module.get<CabinsService>(CabinsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of cabins', async () => {
            const result = await controller.findAll();
            expect(result).toEqual([mockCabin]);
            expect(mockCabinsService.findAll).toHaveBeenCalled();
        });

        it('should handle errors when finding all cabins', async () => {
            jest.spyOn(service, 'findAll').mockRejectedValueOnce(new Error('Database error'));

            await expect(controller.findAll()).rejects.toThrow('Database error');
        });
    });

    describe('findOne', () => {
        it('should return a single cabin by id', async () => {
            const result = await controller.findOne('507f1f77bcf86cd799439011');
            expect(result).toEqual(mockCabin);
            expect(mockCabinsService.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('should handle errors when finding a cabin by id', async () => {
            jest.spyOn(service, 'findById').mockRejectedValueOnce(new Error('Cabin not found'));

            await expect(controller.findOne('invalid-id')).rejects.toThrow('Cabin not found');
        });
    });
});