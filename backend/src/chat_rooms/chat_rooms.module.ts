import { Module } from '@nestjs/common';
import { ChatRoomsService } from './chat_rooms.service';
import { ChatRoomsController } from './chat_rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './chat_room.entity';
import { ChatParticipant } from '../chat_participants/chat_participant.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, ChatParticipant]), UsersModule],
  providers: [JwtService, ChatRoomsService],
  controllers: [ChatRoomsController],
  exports: [ChatRoomsService],
})
export class ChatRoomsModule {}
