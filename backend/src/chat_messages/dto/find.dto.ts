import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class findChatMessageDto {
  chatRoomId?: number;

  sent_time_from?: Date;

  sent_time_till?: Date;
}
