import { Module } from '@nestjs/common';
import { ChatRoomsService } from './chat_rooms.service';
import { ChatRoomsController } from './chat_rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './chat_room.entity';
import { ChatParticipant } from '../chat_participants/chat_participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, ChatParticipant])],
  providers: [ChatRoomsService],
  controllers: [ChatRoomsController],
})
export class ChatRoomsModule {}
