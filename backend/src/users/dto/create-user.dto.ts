import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEmail,
  IsBoolean,
} from 'class-validator';
import { User, UserStatus } from '../user.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto extends PartialType(User) {
  @ApiProperty({ description: 'User avatar' })
  @IsOptional()
  avatar: string;

  @ApiProperty({ description: 'User nickname' })
  @IsNotEmpty()
  @IsString()
  nickname: string;

  @ApiProperty({ description: 'enable two factor authentication' })
  @IsOptional()
  // @IsNotEmpty() // for test do not forget to have isnotempty when going further
  @IsBoolean()
  two_factor_enabled: boolean;

  @ApiProperty({ description: 'Second authentication status' })
  @IsOptional()
  @IsBoolean()
  is_second_auth_done: boolean;

  @ApiProperty({ description: 'Two factor authentication secret' })
  @IsOptional()
  @IsString()
  two_factor_auth_secret: string;

  @ApiProperty({ description: 'email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Ladder level' })
  @IsOptional()
  @IsNumber()
  ladder_level: number;

  @ApiProperty({ description: 'User status' })
  @IsOptional()
  @IsEnum(UserStatus)
  user_status: UserStatus;
}
