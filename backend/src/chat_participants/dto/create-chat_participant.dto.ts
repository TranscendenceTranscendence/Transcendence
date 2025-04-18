import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import {
  chat_participant_roles,
  ChatParticipant,
} from '../../chat_participants/chat_participant.entity';

export class CreateChatParticipantDto extends PartialType(ChatParticipant) {
  @ApiProperty({ description: 'Chat participant role' })
  // @IsOptional()
  @IsEnum(chat_participant_roles)
  chat_participant_role?: chat_participant_roles;

  @ApiProperty({ description: 'left at this date' })
  @IsOptional()
  leftAt?: Date;

  @ApiProperty({ description: 'Is banned' })
  @IsOptional()
  @IsBoolean()
  is_banned?: boolean;

  @ApiProperty({ description: 'Is muted' })
  @IsOptional()
  @IsBoolean()
  is_muted?: boolean;

  @ApiProperty({ description: 'Entrance time' })
  @IsOptional()
  @IsDate()
  entrance_time?: Date;

  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @ApiProperty({ description: 'Chat room ID' })
  @IsNotEmpty()
  @IsNumber()
  chat_room_id: number;
}
