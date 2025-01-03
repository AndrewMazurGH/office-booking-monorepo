import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';

export class CreateCabinDto {
    @ApiProperty({
        example: 'Heaven Skyscraper',
        description: 'The name of the cabin',
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: 5,
        description: 'Number of people this cabin can accommodate',
    })
    @IsNumber()
    @Min(1)
    capacity: number;

    @ApiProperty({
        example: 'Kyiv',
        description: 'Optional location of the cabin',
        required: false,
    })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({
        example: 'A luxurious cabin above the clouds.',
        description: 'Short cabin description',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: true,
        description: 'Whether this cabin is available for booking',
        default: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;
}
