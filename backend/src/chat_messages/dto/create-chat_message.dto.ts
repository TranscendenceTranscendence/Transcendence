import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ChatMessage } from '../../chat_messages/chat_message.entity';

export interface Message {
  content: string;
}

export class CreateChatMessageDto extends PartialType(ChatMessage) {
  @ApiProperty({ description: 'content' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'sent_time' })
  //   @IsDate()
  // You don't need IsNotEmpty if the field can be set to a default value.
  sent_time: Date;

  @ApiProperty({ description: 'user_id' })
  @IsNotEmpty()
  @IsNumber()
  user_id: number; // Change this to number

  @ApiProperty({ description: 'chat_room_id' })
  @IsNotEmpty()
  @IsNumber()
  chat_room_id: number; // Change this to number
}
