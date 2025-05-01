import { ApiProperty } from '@nestjs/swagger';

export class PlayerStatisticsDto {
  @ApiProperty({ description: 'Total number of games played', example: 10 })
  totalGames: number;

  @ApiProperty({ description: 'Number of games won', example: 7 })
  gamesWon: number;

  @ApiProperty({ description: 'Number of games lost', example: 3 })
  gamesLost: number;

  @ApiProperty({ description: 'Win percentage', example: 70 })
  winPercentage: number;

  @ApiProperty({ description: 'Total points scored', example: 42 })
  totalPoints: number;

  @ApiProperty({ description: 'Average points per game', example: 4.2 })
  averagePointsPerGame: number;

  @ApiProperty({ description: 'Longest win streak', example: 3 })
  longestWinStreak: number;
}
