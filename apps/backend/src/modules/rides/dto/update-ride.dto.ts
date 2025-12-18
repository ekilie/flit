import { PartialType } from '@nestjs/swagger';
import { CreateRideDto } from './create-ride.dto';
import { IsEnum, IsOptional, IsInt, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RideStatus } from '../entities/ride.entity';

export class UpdateRideDto extends PartialType(CreateRideDto) {
  @ApiPropertyOptional({
    enum: RideStatus,
    description: 'Ride status',
  })
  @IsOptional()
  @IsEnum(RideStatus)
  status?: RideStatus;

  @ApiPropertyOptional({ description: 'Driver user ID' })
  @IsOptional()
  @IsInt()
  driverId?: number;

  @ApiPropertyOptional({ description: 'Vehicle ID' })
  @IsOptional()
  @IsInt()
  vehicleId?: number;

  @ApiPropertyOptional({ description: 'Ride fare' })
  @IsOptional()
  @IsNumber()
  fare?: number;

  @ApiPropertyOptional({ description: 'Distance in kilometers' })
  @IsOptional()
  @IsNumber()
  distance?: number;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
  @IsOptional()
  @IsInt()
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Actual duration in minutes' })
  @IsOptional()
  @IsInt()
  actualDuration?: number;
}
