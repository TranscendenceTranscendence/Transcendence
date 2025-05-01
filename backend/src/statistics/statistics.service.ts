import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from '../games/game.entity';
import { Repository } from 'typeorm';
import { PlayerStatisticsDto } from './dto/statistics.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
  ) {}

  async getPlayerStatistics(playerId: number): Promise<PlayerStatisticsDto> {
    if (!playerId || Number.isNaN(playerId)) {
      throw new BadRequestException('Player ID is required');
    }
    const gamesAsPlayer1 = await this.gamesRepository.find({
      where: { player1_user_id: playerId, status: GameStatus.CLOSED },
    });
    const gamesAsPlayer2 = await this.gamesRepository.find({
      where: { player2_user_id: playerId, status: GameStatus.CLOSED },
    });
    if (
      (!gamesAsPlayer1 || gamesAsPlayer1.length === 0) &&
      (!gamesAsPlayer2 || gamesAsPlayer2.length === 0)
    ) {
      return {
        totalGames: 0,
        gamesWon: 0,
        gamesLost: 0,
        winPercentage: 0,
        totalPoints: 0,
        averagePointsPerGame: 0,
        longestWinStreak: 0,
      };
    }
    const allGames = [...gamesAsPlayer1, ...gamesAsPlayer2];
    const totalGames = allGames.length;
    const gamesWon = allGames.filter(
      (game) => game.winner_user_id === playerId,
    ).length;
    const gamesLost = totalGames - gamesWon;
    const winPercentage = totalGames > 0 ? (gamesWon / totalGames) * 100 : 0;
    let totalPoints = 0;

    for (const game of allGames) {
      const score =
        game.player1_user_id == playerId ? game.score[0] : game.score[1];
      totalPoints += score;
    }
    const sortedGames = allGames.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    let longestStreak = 0;
    let currentStreak = 0;

    for (const game of sortedGames) {
      if (game.winner_user_id === playerId) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    return {
      totalGames,
      gamesWon,
      gamesLost,
      winPercentage,
      totalPoints,
      averagePointsPerGame: totalGames > 0 ? totalPoints / totalGames : 0,
      longestWinStreak: longestStreak,
    };
  }
}
