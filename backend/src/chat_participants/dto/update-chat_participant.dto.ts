import { PartialType } from '@nestjs/mapped-types';
import { CreateChatParticipantDto } from './create-chat_participant.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { chat_participant_roles } from '../../chat_participants/chat_participant.entity';

export class UpdateChatParticipantDto extends PartialType(
  CreateChatParticipantDto,
) {
  @ApiProperty({ description: 'Chat participant role' })
  @IsOptional()
  @IsEnum(chat_participant_roles)
  chat_participant_role?: chat_participant_roles;

  @ApiProperty({ description: 'Is banned' })
  @IsOptional()
  @IsBoolean()
  is_banned?: boolean;

  @ApiProperty({ description: 'Is muted' })
  @IsOptional()
  @IsBoolean()
  is_muted?: boolean;
}
