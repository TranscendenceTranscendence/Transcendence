import { Module } from '@nestjs/common';
import { ChatMessagesService } from './chat_messages.service';
import { ChatMessagesController } from './chat_messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './chat_message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage])],
  providers: [ChatMessagesService],
  controllers: [ChatMessagesController],
})
export class ChatMessagesModule {}
