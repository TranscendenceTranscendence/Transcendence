import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatRoomsModule } from '../chat_rooms/chat_rooms.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import JwtConfig from '../config/jwt.config';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ChatRoomsModule,
    AuthModule,
    UsersModule,
    ConfigModule.forFeature(JwtConfig),
  ],
  providers: [ChatGateway],
})
export class ChatModule {}
