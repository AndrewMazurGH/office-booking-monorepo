import { Test, TestingModule } from '@nestjs/testing';
import { CabinsService } from './cabins.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cabin, CabinDocument } from '../../shared/schemas/cabin.schema';

describe('CabinsService', () => {
    let service: CabinsService;
    let model: Model<CabinDocument>;

    const mockCabin = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Cabin',
        capacity: 4,
        description: 'A test cabin',
        isAvailable: true,
    };

    const mockCabinModel = {
        find: jest.fn(),
        findById: jest.fn(),
        exec: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CabinsService,
                {
                    provide: getModelToken(Cabin.name),
                    useValue: mockCabinModel,
                },
            ],
        }).compile();

        service = module.get<CabinsService>(CabinsService);
        model = module.get<Model<CabinDocument>>(getModelToken(Cabin.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all available cabins', async () => {
            const mockAvailableCabins = [mockCabin];
            mockCabinModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(mockAvailableCabins),
            });

            const result = await service.findAll();
            expect(result).toEqual(mockAvailableCabins);
            expect(mockCabinModel.find).toHaveBeenCalledWith({ isAvailable: true });
        });

        it('should return empty array when no cabins are available', async () => {
            mockCabinModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce([]),
            });

            const result = await service.findAll();
            expect(result).toEqual([]);
            expect(mockCabinModel.find).toHaveBeenCalledWith({ isAvailable: true });
        });

        it('should handle database errors when finding all cabins', async () => {
            mockCabinModel.find.mockReturnValue({
                exec: jest.fn().mockRejectedValueOnce(new Error('Database error')),
            });

            await expect(service.findAll()).rejects.toThrow('Database error');
        });
    });

    describe('findById', () => {
        it('should return a single cabin by id', async () => {
            mockCabinModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(mockCabin),
            });

            const result = await service.findById('507f1f77bcf86cd799439011');
            expect(result).toEqual(mockCabin);
            expect(mockCabinModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('should return null when cabin is not found', async () => {
            mockCabinModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null),
            });

            const result = await service.findById('nonexistent-id');
            expect(result).toBeNull();
        });

        it('should handle database errors when finding cabin by id', async () => {
            mockCabinModel.findById.mockReturnValue({
                exec: jest.fn().mockRejectedValueOnce(new Error('Database error')),
            });

            await expect(service.findById('507f1f77bcf86cd799439011')).rejects.toThrow('Database error');
        });
    });
});