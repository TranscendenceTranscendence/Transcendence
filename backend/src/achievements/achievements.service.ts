import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { Achievement } from './achievement.entity';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private readonly achievementsRepository: Repository<Achievement>,
  ) {}

  async create(
    createAchievementDto: CreateAchievementDto,
  ): Promise<Achievement> {
    const achievementData =
      await this.achievementsRepository.create(createAchievementDto);
    return this.achievementsRepository.save(achievementData);
  }

  async findAll(): Promise<Achievement[]> {
    return await this.achievementsRepository.find();
  }

  async findOne(id: number): Promise<Achievement> {
    const achievementData = await this.achievementsRepository.findOneBy({ id });
    if (!achievementData) throw new HttpException('Achievement Not Found', 404);
    return achievementData;
  }

  async findByUserId(userId: number): Promise<Achievement[]> {
    const userData = await this.achievementsRepository.find({
      where: { user: { id: userId } },
    });
    if (!userData) throw new HttpException('Achievement Not Found', 404);
    return userData;
  }

  async update(
    id: number,
    updateAchievementDto: UpdateAchievementDto,
  ): Promise<Achievement> {
    const existingAchievement = await this.findOne(id);
    const achievementData = this.achievementsRepository.merge(
      existingAchievement,
      updateAchievementDto,
    );
    return await this.achievementsRepository.save(achievementData);
  }

  async remove(id: number): Promise<Achievement> {
    const existingAchievement = await this.findOne(id);
    return await this.achievementsRepository.remove(existingAchievement);
  }
}
