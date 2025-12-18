import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description:
      'The email of the user. This must be a valid and registered email address.',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'The password of the user. This should be a secure and strong password.',
    example: 'SafePassword123!',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
