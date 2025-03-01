import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { Game, GameStatus } from './game.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
  ) {}

  async isPlayerInGame(playerId: number): Promise<boolean> {
    try {
      const activeGame = await this.gamesRepository.findOne({
        where: [
          {
            player1_user_id: playerId,
            status: In([GameStatus.PENDING, GameStatus.OPEN]),
          },
          {
            player2_user_id: playerId,
            status: In([GameStatus.PENDING, GameStatus.OPEN]),
          },
        ],
      });

      return !!activeGame;
    } catch (error: unknown) {
      void error;
      throw new HttpException('Error checking player game status', 500);
    }
  }

  async create(createGameDto: CreateGameDto): Promise<Game> {
    const isInGame = await this.isPlayerInGame(createGameDto.player1_user_id);
    if (isInGame) {
      throw new HttpException('Player is already in an active game', 400);
    }
    const gameData = await this.gamesRepository.create(createGameDto);
    return this.gamesRepository.save(gameData);
  }

  async findAll(): Promise<Game[]> {
    return await this.gamesRepository.find();
  }

  async findByUserId(id: number): Promise<Game[]> {
    const gameData = await this.gamesRepository.find({
      where: [{ player1_user_id: id }, { player2_user_id: id }],
    });
    if (!gameData) throw new HttpException('Game Not Found', 404);
    return gameData;
  }

  async remove(id: number): Promise<Game[]> {
    const existingGame = await this.findByUserId(id);
    return await this.gamesRepository.remove(existingGame);
  }
}
