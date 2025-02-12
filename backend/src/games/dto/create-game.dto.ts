import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNumber,
  IsArray,
  IsDate,
  IsOptional,
} from 'class-validator';
import { GameStatus } from '../game.entity';

export class CreateGameDto {
  @ApiProperty({ description: 'Room identifier' })
  @IsString()
  room_identifier: string;

  @ApiProperty({ description: 'Game status', enum: GameStatus })
  @IsEnum(GameStatus)
  status: GameStatus;

  @ApiProperty({ description: 'Player 1 ID' })
  @IsNumber()
  player1_user_id: number;

  @ApiProperty({ description: 'Player 2 ID' })
  @IsNumber()
  @IsOptional()
  player2_user_id: number;

  @ApiProperty({ description: 'Winner ID' })
  @IsNumber()
  @IsOptional()
  winner_user_id: number;

  @ApiProperty({ description: 'Game score', type: [Number] })
  @IsArray()
  score: number[];

  @ApiProperty({ description: 'Game end time' })
  @IsDate()
  @IsOptional()
  ended_at: Date;

  @ApiProperty({ description: 'Game creation time' })
  @IsDate()
  created_at: Date;
}
