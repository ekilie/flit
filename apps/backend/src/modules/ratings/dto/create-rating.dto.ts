import { IsInt, IsString, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RatingType } from '../entities/rating.entity';

const MIN_RATING = 1;
const MAX_RATING = 5;

export class CreateRatingDto {
  @ApiProperty({
    example: MAX_RATING,
    description: `Rating value (${MIN_RATING}-${MAX_RATING})`,
    minimum: MIN_RATING,
    maximum: MAX_RATING,
  })
  @IsInt()
  @Min(MIN_RATING)
  @Max(MAX_RATING)
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
