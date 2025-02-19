import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Achievement } from '../achievement.entity';

export class CreateAchievementDto extends PartialType(Achievement) {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  user_id: number;
}
