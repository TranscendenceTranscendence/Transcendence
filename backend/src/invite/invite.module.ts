import { Module, forwardRef } from '@nestjs/common';
import { InviteService } from './invite.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invite } from './invite.entity';
import { InviteController } from './invite.controller';
import { GamesModule } from '../games/games.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invite, User]),
    forwardRef(() => GamesModule), // Use forwardRef to break circular dependency
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
  providers: [InviteService],
  exports: [InviteService],
})
export class InviteModule {}
