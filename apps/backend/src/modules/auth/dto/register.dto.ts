import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export enum Role {
  Rider = 'Rider',
  Driver = 'Driver',
}

export const MAX_PHONE_NUMBER_LENGTH = 15;
export const MIN_PHONE_NUMBER_LENGTH = 10;

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(MAX_PHONE_NUMBER_LENGTH)
  @MinLength(MIN_PHONE_NUMBER_LENGTH)
  phoneNumber: string;

  @ApiProperty({
    description: 'Password for the user account (minimum 6 characters)',
    example: 'SecurePass123!',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Role of the user',
    example: Role.Rider,
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
