import { Module, forwardRef } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { GameGateway } from './game.gateway';
import { InviteModule } from '../invite/invite.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    forwardRef(() => InviteModule), // Use forwardRef to break circular dependency
  ],
  providers: [GamesService, GameGateway],
  controllers: [GamesController],
  exports: [GamesService],
})
export class GamesModule {}
