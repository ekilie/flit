import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSurgeZoneDto {
  @ApiProperty({
    description: 'Surge zone name',
    example: 'Mikocheni Business Area',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Center latitude of surge zone',
    example: -6.7924,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  centerLatitude: number;

  @ApiProperty({
    description: 'Center longitude of surge zone',
    example: 39.2083,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  centerLongitude: number;

  @ApiProperty({
    description: 'Radius in kilometers',
    example: 2.5,
  })
  @IsNumber()
  @Min(0.1)
  radiusKm: number;

  @ApiProperty({
    description: 'Surge multiplier (1.0 = normal, 1.5 = 50% surge)',
    example: 1.5,
  })
  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  surgeMultiplier: number;

  @ApiProperty({
    description: 'Start time for surge (optional)',
    example: '2025-12-30T17:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({
    description: 'End time for surge (optional)',
    example: '2025-12-30T20:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiProperty({
    description: 'Is this surge zone active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
