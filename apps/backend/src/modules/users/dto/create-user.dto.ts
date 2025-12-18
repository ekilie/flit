import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Full name of the user.',
    example: 'Tachera Sasi',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    description: 'Phone number of the user.',
    example: '+1234567890',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  phoneNumber: string;

  @ApiProperty({
    description: 'Email address of the user.',
    example: 'tachera@ekilie.com',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    description: 'Password for the user account. Will be hashed before saving.',
    example: 'tachisgreat!',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  password: string;

  @ApiProperty({
    description: 'ID of the role assigned to the user.',
    example: 'd3e54abc-91e1-4e2b-812a-91a863e2f344',
    required: false,
  })
  @IsOptional()
  @IsString()
  roleId?: string;
}
