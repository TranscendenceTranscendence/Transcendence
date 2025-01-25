import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from './friend.entity';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friend, User]),
    UsersModule,
  ],
  providers: [FriendsService, JwtService],
  controllers: [FriendsController],
})
export class FriendsModule {}