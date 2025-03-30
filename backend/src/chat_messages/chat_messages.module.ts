import { Module } from '@nestjs/common';
import { ChatMessagesService } from './chat_messages.service';
import { ChatMessagesController } from './chat_messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './chat_message.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { AchievementsModule } from '../achievements/achievements.module';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, User]),
    AchievementsModule,
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [ChatMessagesService, UsersService, JwtService],
  controllers: [ChatMessagesController],
})
export class ChatMessagesModule {}
