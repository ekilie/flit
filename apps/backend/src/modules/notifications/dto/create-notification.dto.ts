import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    example: 'New Ride Request',
    description: 'Notification title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'You have a new ride request',
    description: 'Notification message',
  })
  @IsString()
  message: string;

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.RIDE_REQUEST,
    description: 'Type of notification',
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({ description: 'Is notification read', default: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ description: 'Additional notification data' })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  userId: number;
}
