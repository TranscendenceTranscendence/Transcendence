import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
// import { chat_room_types } from '../chat_room.entity';

export enum chat_participant_roles {
  Owner = 'owner',
  Admin = 'admin',
  Guest = 'guest',
}

export enum chat_room_types {
  Public = 'public',
  Protected = 'protected',
  Private = 'private',
  Dm = 'Dm',
}

export class CreateChatRoomDto {
  @ApiProperty({ description: 'ChatRoom title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'ChatRoom password' })
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty({ description: 'Creation date' })
  // @IsNotEmpty()
  // @IsDate()
  creation_date: Date;

  @ApiProperty({ description: 'ChatRoom types' })
  @IsEnum(chat_room_types)
  @IsOptional()
  chat_room_type: chat_room_types;

  @ApiProperty({ description: 'user_id' })
  @IsOptional()
  user_id: number;

  @ApiProperty({ description: 'Participant role' })
  @IsEnum(chat_participant_roles)
  @IsOptional()
  role: chat_participant_roles;
}
