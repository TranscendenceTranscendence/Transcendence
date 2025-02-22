import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement, type AchievementType } from './achievement.entity';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private readonly achievementsRepository: Repository<Achievement>,
  ) {}

  async addAchievementToUser(
    userId: number,
    achievementType: AchievementType,
  ): Promise<Achievement | false> {
    const achievementData = { userId, type: achievementType };
    const achievement = await this.achievementsRepository.findOne({
      where: achievementData,
    });
    if (achievement)
      return false; // Achievement already exists for this user
    else return this.achievementsRepository.save(achievementData);
  }

  async findByUserId(userId: number): Promise<Achievement[]> {
    const userData = await this.achievementsRepository.find({
      where: { user: { id: userId } },
    });
    if (!userData) throw new HttpException('Achievement Not Found', 404);
    return userData;
  }
}
