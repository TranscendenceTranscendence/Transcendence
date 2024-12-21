import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, } from 'class-validator';
import {DeepPartial, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';
import { User } from '../../users/user.entity';
import { PartialType } from '@nestjs/mapped-types';
import { Achievement } from '../achievement.entity';

export class CreateAchievementDto extends PartialType(Achievement) {

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

}