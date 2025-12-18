import { IsInt, IsString, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RatingType } from '../entities/rating.entity';

export class CreateRatingDto {
  @ApiProperty({
    example: 5,
    description: 'Rating value (1-5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Review text' })
  @IsOptional()
  @IsString()
  review?: string;

  @ApiProperty({
    enum: RatingType,
    example: RatingType.RIDER_TO_DRIVER,
    description: 'Type of rating',
  })
  @IsEnum(RatingType)
  type: RatingType;

  @ApiProperty({ example: 1, description: 'User ID giving the rating' })
  @IsInt()
  fromUserId: number;

  @ApiProperty({ example: 2, description: 'User ID receiving the rating' })
  @IsInt()
  toUserId: number;

  @ApiProperty({ example: 1, description: 'Ride ID' })
  @IsInt()
  rideId: number;
}
