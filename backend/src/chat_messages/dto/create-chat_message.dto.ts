import { PartialType } from '@nestjs/mapped-types';
import { ChatMessage } from '../chat_message.entity';

export class CreateChatMessageDto extends PartialType(ChatMessage) {
  content: string;
  chat_room_id: number;
}
