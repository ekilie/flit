import { IsNumber, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 25.5, description: 'Payment amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
    description: 'Payment method',
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
    description: 'Payment status',
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Transaction ID from payment gateway' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ description: 'Payment description or notes' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1, description: 'Ride ID' })
  @IsInt()
  rideId: number;

  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  userId: number;
}
