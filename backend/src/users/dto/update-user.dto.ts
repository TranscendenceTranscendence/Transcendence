import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { User } from '../user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ type: 'string', description: 'The nickname of the user.' })
  nickname: string;
  @ApiProperty({ type: 'string', description: 'The avatar of the user.' })
  avatar: string;
  @ApiProperty({
    type: 'boolean',
    description: 'The two factor authentication status of the user.',
  })
  two_factor_enabled: boolean;
}

export class UpdateUserResponse {
  @ApiProperty()
  success: boolean;
  @ApiProperty({ type: 'string', required: false })
  message?: string;
  @ApiProperty({ type: 'object', required: false })
  errors?: { [key: string]: string };
}

export class UpdateAddUserToBlockedListDto {
  @ApiProperty({ type: 'User', description: 'The ID of the user to block.' })
  targetUser: User;

  @ApiProperty({ type: 'string', description: 'The nickname of the user.' })
  @IsOptional()
  nickname?: string;

  @ApiProperty({ type: 'string', description: 'The avatar of the user.' })
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    type: 'boolean',
    description: 'The two factor authentication status of the user.',
  })
  @IsOptional()
  two_factor_enabled?: boolean;
}
