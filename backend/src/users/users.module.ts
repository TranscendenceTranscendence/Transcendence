import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import JwtConfig from '../config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import FortyTwoOauthConfig from '../config/ft-oauth.config';
import { AchievementsService } from '../achievements/achievements.service';
import { Achievement } from '../achievements/achievement.entity';
import { UsersGateway } from './users.gateway';
import { Blocked } from '../blockeds/blocked.entity';
import { BlockedsModule } from '../blockeds/blockeds.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Achievement, Blocked]),
    ConfigModule.forFeature(FortyTwoOauthConfig),
    ConfigModule.forFeature(JwtConfig),
    BlockedsModule,
  ],
  providers: [UsersService, JwtService, AchievementsService, UsersGateway],
  exports: [UsersService, TypeOrmModule],
  controllers: [UsersController],
})
export class UsersModule {}
