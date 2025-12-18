import { IsNumber, IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRideDto {
  @ApiProperty({ example: 40.7128, description: 'Pickup latitude' })
  @IsNumber()
  pickupLatitude: number;

  @ApiProperty({ example: -74.006, description: 'Pickup longitude' })
  @IsNumber()
  pickupLongitude: number;

  @ApiProperty({
    example: '123 Main St, New York, NY',
    description: 'Pickup address',
  })
  @IsString()
  pickupAddress: string;

  @ApiProperty({ example: 40.7589, description: 'Dropoff latitude' })
  @IsNumber()
  dropoffLatitude: number;

  @ApiProperty({ example: -73.9851, description: 'Dropoff longitude' })
  @IsNumber()
  dropoffLongitude: number;

  @ApiProperty({
    example: '456 Broadway, New York, NY',
    description: 'Dropoff address',
  })
  @IsString()
  dropoffAddress: string;

  @ApiPropertyOptional({ description: 'Additional notes for the ride' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 1, description: 'Rider user ID' })
  @IsInt()
  riderId: number;
}
