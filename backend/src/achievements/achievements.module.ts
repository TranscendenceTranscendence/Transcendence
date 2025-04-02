import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './achievement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement])],
  exports: [AchievementsService],
  providers: [AchievementsService],
  controllers: [AchievementsController],
})
export class AchievementsModule {}
