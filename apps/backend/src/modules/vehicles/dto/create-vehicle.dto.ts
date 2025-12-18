import { IsString, IsInt, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota', description: 'Vehicle make' })
  @IsString()
  make: string;

  @ApiProperty({ example: 'Camry', description: 'Vehicle model' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2022, description: 'Vehicle year' })
  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @ApiProperty({ example: 'ABC123', description: 'License plate number' })
  @IsString()
  licensePlate: string;

  @ApiProperty({ example: 'Black', description: 'Vehicle color' })
  @IsString()
  color: string;

  @ApiProperty({ example: 4, description: 'Passenger capacity' })
  @IsInt()
  @Min(1)
  @Max(20)
  capacity: number;

  @ApiProperty({
    enum: VehicleType,
    example: VehicleType.SEDAN,
    description: 'Type of vehicle',
  })
  @IsEnum(VehicleType)
  type: VehicleType;

  @ApiPropertyOptional({ description: 'Vehicle image URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 1, description: 'Driver ID' })
  @IsInt()
  driverId: number;
}
