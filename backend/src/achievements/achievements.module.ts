import { forwardRef, Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './achievement.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Achievement]),
    forwardRef(() => UsersModule),
  ],
  exports: [AchievementsService, TypeOrmModule.forFeature([Achievement])],
  providers: [AchievementsService],
  controllers: [AchievementsController],
})
export class AchievementsModule {}
