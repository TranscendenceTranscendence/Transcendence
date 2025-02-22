import { PartialType } from '@nestjs/mapped-types';
import { Achievement } from '../achievement.entity';

export class GetAchievementsByUserIdRequestDto extends PartialType(
  Achievement,
) {
  userId: number;
}
