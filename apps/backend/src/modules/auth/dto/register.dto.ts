import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export enum Role {
  Rider = 'Rider',
  Driver = 'Driver',
  Admin = 'Admin',
}

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
