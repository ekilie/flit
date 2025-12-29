import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePricingConfigDto {
  @ApiProperty({
    description: 'Vehicle type',
    example: 'economy',
  })
  @IsString()
  vehicleType: string;

  @ApiProperty({
    description: 'Base fare in TSh',
    example: 2000,
  })
  @IsNumber()
  @Min(0)
  baseFare: number;

  @ApiProperty({
    description: 'Rate per kilometer in TSh',
    example: 1500,
  })
  @IsNumber()
  @Min(0)
  perKmRate: number;

  @ApiProperty({
    description: 'Rate per minute in TSh',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  perMinuteRate: number;

  @ApiProperty({
    description: 'Minimum fare in TSh',
    example: 3000,
  })
  @IsNumber()
  @Min(0)
  minimumFare: number;

  @ApiProperty({
    description: 'Booking fee in TSh',
    example: 500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bookingFee?: number;

  @ApiProperty({
    description: 'Cancellation fee in TSh',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cancellationFee?: number;

  @ApiProperty({
    description: 'Is this config active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

