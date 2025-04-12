import { ApiProperty } from '@nestjs/swagger';
import { ChatRoom } from '../chat_room.entity';

export class ChatRoomsResponse {
  @ApiProperty()
  success: boolean;
  @ApiProperty()
  chatRooms?: ChatRoom[];
  @ApiProperty()
  message?: string;
}

export class ChatRoomResponse {
  @ApiProperty()
  success: boolean;
  @ApiProperty()
  chatRooms?: ChatRoom[];
  @ApiProperty()
  message?: string;
}
