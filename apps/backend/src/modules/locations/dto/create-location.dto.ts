import { IsNumber, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ example: 40.7128, description: 'Latitude' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -74.006, description: 'Longitude' })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 10.5, description: 'GPS accuracy in meters' })
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @ApiPropertyOptional({ example: 45.5, description: 'Speed in km/h' })
  @IsOptional()
  @IsNumber()
  speed?: number;

  @ApiPropertyOptional({ example: 90.0, description: 'Heading in degrees' })
  @IsOptional()
  @IsNumber()
  heading?: number;

  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  userId: number;

  @ApiPropertyOptional({ example: 1, description: 'Ride ID (optional)' })
  @IsOptional()
  @IsInt()
  rideId?: number;
}
