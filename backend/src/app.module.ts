import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AchievementsModule } from './achievements/achievements.module';
import { ChatMessagesModule } from './chat_messages/chat_messages.module';
import { ChatParticipantsModule } from './chat_participants/chat_participants.module';
import { ChatRoomsModule } from './chat_rooms/chat_rooms.module';
import { FriendsModule } from './friends/friends.module';
import { GamesModule } from './games/games.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { ChatModule } from './websockets/chat.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { MulterModule } from '@nestjs/platform-express';
import { StatisticsModule } from './statistics/statistics.module';
import { QueueModule } from './queue/queue.module';
import { InviteModule } from './invite/invite.module';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
    }),
    PassportModule.register({
      session: false,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_NAME,
      entities: [],
      autoLoadEntities: true,
      synchronize: true,
      // logging: true,
      // logger: 'advanced-console', // Makes the logs easier to read
    }),
    StatisticsModule,
    ChatModule,
    UsersModule,
    AchievementsModule,
    ChatMessagesModule,
    ChatParticipantsModule,
    ChatRoomsModule,
    FriendsModule,
    GamesModule,
    QueueModule,
    AuthModule,
    FileUploadModule,
    InviteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
