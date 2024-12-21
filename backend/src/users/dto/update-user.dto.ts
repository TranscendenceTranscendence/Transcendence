import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {ApiProperty} from "@nestjs/swagger";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ type: 'string', description: 'The nickname of the user.' })
  nickname: string;
  @ApiProperty({ type: 'string', format: 'byte', description: 'The avatar of the user.' })
  avatar: Buffer;
  @ApiProperty({ type: 'boolean', description: 'The two factor authentication status of the user.' })
  enable_two_factor: boolean;


}