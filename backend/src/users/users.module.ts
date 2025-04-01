import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import JwtConfig from '../config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import FortyTwoOauthConfig from '../config/ft-oauth.config';
import { UsersGateway } from './users.gateway';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forFeature(FortyTwoOauthConfig),
    AchievementsModule,
    ConfigModule.forFeature(JwtConfig),
  ],
  providers: [UsersService, JwtService, UsersGateway],
  exports: [UsersService, TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
})
export class UsersModule {}
