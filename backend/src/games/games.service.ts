import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, DataSource } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { Game, GameStatus } from './game.entity';
import { User } from '../users/user.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createGameDto: CreateGameDto): Promise<Game> {
    try {
      const isInGame = await this.isPlayerInGame(createGameDto.player1_user_id);
      if (isInGame) {
        throw new HttpException(
          'Player is already in an active game',
          HttpStatus.BAD_REQUEST,
        );
      }
      const gameData = await this.gamesRepository.create(createGameDto);
      return this.gamesRepository.save(gameData);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to create game',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async startGame(roomId: string): Promise<Game> {
    try {
      const gameData = await this.gamesRepository.findOne({
        where: { room_identifier: roomId },
      });
      if (!gameData) {
        throw new HttpException('Game Not Found', HttpStatus.NOT_FOUND);
      }
      if (gameData.status !== GameStatus.COUNTDOWN) {
        throw new HttpException(
          'Game is not in countdown status',
          HttpStatus.BAD_REQUEST,
        );
      }
      gameData.status = GameStatus.ONGOING;
      return await this.gamesRepository.save(gameData);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to start game',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async joinGame(gameId: string, playerId: number): Promise<Game> {
    const queryRunner =
      this.gamesRepository.manager.connection.createQueryRunner();
    try {
      const isInGame = await this.isPlayerInGame(playerId);
      if (isInGame) {
        throw new HttpException(
          'Player is already in an active game',
          HttpStatus.BAD_REQUEST,
        );
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const gameData = await queryRunner.manager.findOne(Game, {
        where: { room_identifier: gameId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!gameData) {
        throw new HttpException('Game Not Found', HttpStatus.NOT_FOUND);
      }

      if (gameData.player2_user_id) {
        throw new HttpException('Game is already full', HttpStatus.BAD_REQUEST);
      }

      if (
        gameData.status === GameStatus.COUNTDOWN ||
        gameData.status === GameStatus.ONGOING
      ) {
        throw new HttpException(
          'Game is already started',
          HttpStatus.BAD_REQUEST,
        );
      }

      gameData.player2_user_id = playerId;
      gameData.status = GameStatus.COUNTDOWN;

      const updatedGame = await queryRunner.manager.save(Game, gameData);
      await queryRunner.commitTransaction();

      return updatedGame;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to join game',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  async isPlayerInGame(playerId: number): Promise<Game> {
    try {
      const activeGame = await this.gamesRepository.findOne({
        where: [
          {
            player1_user_id: playerId,
            status: In([
              GameStatus.PENDING,
              GameStatus.COUNTDOWN,
              GameStatus.ONGOING,
            ]),
          },
          {
            player2_user_id: playerId,
            status: In([
              GameStatus.PENDING,
              GameStatus.COUNTDOWN,
              GameStatus.ONGOING,
            ]),
          },
        ],
      });
      if (!activeGame) return null;
      return activeGame;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Error checking player game status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<Game[]> {
    try {
      return await this.gamesRepository.find();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to fetch games',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByUserId(id: number): Promise<Game[]> {
    try {
      const gameData = await this.gamesRepository.find({
        where: [{ player1_user_id: id }, { player2_user_id: id }],
      });

      if (!gameData || gameData.length === 0) {
        throw new HttpException('Game Not Found', HttpStatus.NOT_FOUND);
      }

      return gameData;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        `Failed to find games for user ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findGameById(id: number): Promise<Game> {
    try {
      const gameData = await this.gamesRepository.findOne({
        where: { id },
      });
      if (!gameData) {
        throw new HttpException('Game Not Found', HttpStatus.NOT_FOUND);
      }
      return gameData;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to find game with id ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<Game[]> {
    try {
      const existingGame = await this.findByUserId(id);
      return await this.gamesRepository.remove(existingGame);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        `Failed to remove games for user ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllExceptUser(userId: number): Promise<Game[]> {
    try {
      const games = await this.gamesRepository.find({
        where: [
          {
            player1_user_id: Not(userId),
            player2_user_id: 0,
            status: GameStatus.PENDING,
          },
        ],
      });
      return games;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Error finding available games',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByRoomIdentifier(roomIdentifier: string): Promise<Game> {
    try {
      const gameData = await this.gamesRepository.findOne({
        where: { room_identifier: roomIdentifier },
      });

      if (!gameData) {
        throw new HttpException('Game Not Found', HttpStatus.NOT_FOUND);
      }

      return gameData;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to fetch game by room identifier',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkIfUserInCurrentGame(
    userId: number,
    roomIdentifier: string,
  ): Promise<boolean> {
    try {
      const game = await this.gamesRepository.findOne({
        where: {
          room_identifier: roomIdentifier,
          player1_user_id: userId,
        },
      });

      if (!game) {
        const gamePlayer2 = await this.gamesRepository.findOne({
          where: {
            room_identifier: roomIdentifier,
            player2_user_id: userId,
          },
        });

        if (!gamePlayer2) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error(
        `Error checking if user ${userId} is in game ${roomIdentifier}:`,
        error,
      );
      return false;
    }
  }

  async updateGameScore(
    roomId: string,
    score: [number, number],
  ): Promise<Game> {
    try {
      const game = await this.gamesRepository.findOne({
        where: { room_identifier: roomId },
      });

      if (!game) {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      }

      game.score = score;
      return await this.gamesRepository.save(game);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to update game score`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateGameStatus(gameId: string, status: GameStatus): Promise<Game> {
    try {
      const game = await this.gamesRepository.findOne({
        where: { room_identifier: gameId },
      });

      if (!game) {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      }

      game.status = status;
      return await this.gamesRepository.save(game);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to update game status`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  expectedScore(playerRating: number, opponentRating: number): number {
    const exponent = (opponentRating - playerRating) / 400;
    return 1 / (1 + Math.pow(10, exponent));
  }

  async calculateElo(game: Game, winner: number) {
    const K = 32;
    try {
      if (!game.player1_user_id || !game.player2_user_id) {
        throw new Error('Missing player IDs in game record');
      }

      if (!game.winner_user_id) {
        throw new Error('Game has no winner, cannot calculate ELO');
      }

      const user1 = await this.userRepository.findOne({
        where: {
          id: game.player1_user_id,
        },
      });

      const user2 = await this.userRepository.findOne({
        where: {
          id: game.player2_user_id,
        },
      });

      if (!user1 || !user2) {
        throw new Error('One or both players not found');
      }

      const expected1 = await this.expectedScore(user1.elo, user2.elo);
      const expected2 = await this.expectedScore(user2.elo, user1.elo);

      const win1 = Number(winner === user1.id);
      const win2 = Number(winner === user2.id);

      const newElo1 = Math.round(user1.elo + K * (win1 - expected1));
      const newElo2 = Math.round(user2.elo + K * (win2 - expected2));

      user1.elo = newElo1;
      user2.elo = newElo2;

      await this.dataSource.transaction(async (manager) => {
        await manager.save(user1);
        await manager.save(user2);
      });
      return { user1Elo: newElo1, user2Elo: newElo2 };
    } catch (error) {
      console.error('Error calculating ELO:', error.message);
      throw new InternalServerErrorException(
        'Something went wrong trying to calculate ELO',
      );
    }
  }

  async cancelGame(gameId: string): Promise<Game> {
    try {
      const game = await this.gamesRepository.findOne({
        where: { room_identifier: gameId },
      });
      if (!game) {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      }
      game.status = GameStatus.CANCELLED;
      game.ended_at = new Date();
      return await this.gamesRepository.save(game);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to end game`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async finishGameWithFinalScore(
    gameId: string,
    finalScore: [number, number],
  ): Promise<Game> {
    const queryRunner =
      this.gamesRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const game = await queryRunner.manager.findOne(Game, {
        where: { room_identifier: gameId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!game) {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      }

      if (game.status === GameStatus.CLOSED) {
        throw new HttpException(
          'Game is already closed',
          HttpStatus.BAD_REQUEST,
        );
      }

      game.score = finalScore;

      if (finalScore[0] >= 11) {
        game.winner_user_id = game.player1_user_id;
      } else if (finalScore[1] >= 11) {
        game.winner_user_id = game.player2_user_id;
      }

      await this.calculateElo(game, game.winner_user_id);

      game.status = GameStatus.CLOSED;
      game.ended_at = new Date();

      const updatedGame = await queryRunner.manager.save(Game, game);
      await queryRunner.commitTransaction();

      return updatedGame;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to finish game with final score: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }
}
