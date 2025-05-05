import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invite } from './invite.entity';
import { InviteController } from './invite.controller';
import { InviteGateway } from './invite.gateway';
import { GamesModule } from '../games/games.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invite, User]),
    GamesModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [InviteController],
  providers: [InviteService, InviteGateway],
  exports: [InviteService],
})
export class InviteModule {}
