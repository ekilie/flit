import {
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

class UserMetadataDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  twitter?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  display_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserMetadataDto)
  metadata?: UserMetadataDto;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastLogin?: Date;
}
