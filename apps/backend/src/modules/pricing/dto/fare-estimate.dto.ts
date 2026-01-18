import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FareEstimateDto {
  @ApiProperty({
    description: 'Pickup latitude',
    example: -6.7924,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  pickupLat: number;

  @ApiProperty({
    description: 'Pickup longitude',
    example: 39.2083,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  pickupLng: number;

  @ApiProperty({
    description: 'Dropoff latitude',
    example: -6.8162,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  dropoffLat: number;

  @ApiProperty({
    description: 'Dropoff longitude',
    example: 39.2803,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  dropoffLng: number;

  @ApiProperty({
    description: 'Vehicle type',
    example: 'economy',
    enum: ['economy', 'comfort', 'premium', 'xl'],
  })
  @IsString()
  vehicleType: string;

  @ApiProperty({
    description: 'Time of day for pricing calculation (optional)',
    example: '2025-12-30T10:00:00Z',
    required: false,
  })
  @IsOptional()
  timeOfDay?: string;
}
