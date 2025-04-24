import { PartialType } from '@nestjs/mapped-types';
import { chat_room_types, CreateChatRoomDto } from './create-chat_room.dto';

export class UpdateChatRoomDto extends PartialType(CreateChatRoomDto) {
  password?: string;

  chat_room_type?: chat_room_types;
}
