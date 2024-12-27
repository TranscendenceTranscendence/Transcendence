import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsEmail, IsBoolean
 } from 'class-validator';
import { User, user_status } from '../user.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto extends PartialType(User)  {
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
    enable_two_factor: boolean;
  

    @ApiProperty({ description: 'Second authentication check' })
    @IsOptional()
    // @IsNotEmpty() // for test do not forget to have isnotempty when going further
    @IsBoolean()
    is_second_auth_done: boolean;
  
    @ApiProperty({ description: 'Second authentication code' })
    @IsOptional()
    @IsNumber()
    second_auth_code: number;
  
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
    @IsEnum(user_status)
    user_status: user_status;
}