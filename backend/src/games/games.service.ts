import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { Game, GameStatus } from './game.entity';
import { EventEmitter } from 'events';
@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
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
  async joinGame(gameId: number, playerId: number): Promise<Game> {
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
        where: { id: gameId },
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

      try {
        await this.startGame(gameId);
      } catch (error) {
        console.error(`Failed to start game ${gameId}:`, error);
      }

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

  async startGame(gameId: number): Promise<Game> {
    try {
      const game = await this.gamesRepository.findOne({
        where: { id: gameId },
      });

      if (!game) {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      }
      const savedGame = await this.gamesRepository.save(game);

      const eventEmitter = new EventEmitter();
      eventEmitter.emit('countdown', game.room_identifier);

      return savedGame;
    } catch (error) {
      console.error(`Error starting game ${gameId}:`, error);
      throw error;
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
          console.log(`User ${userId} is not in game ${roomIdentifier}`);
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
    gameId: string,
    score: [number, number],
  ): Promise<Game> {
    try {
      const game = await this.gamesRepository.findOne({
        where: { room_identifier: gameId },
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
  async endGame(gameId: string): Promise<Game> {
    try {
      const game = await this.gamesRepository.findOne({
        where: { room_identifier: gameId },
      });
      if (!game) {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      }
      game.score[0] == 11 ? game.winner_user_id = game.player1_user_id : game.winner_user_id = game.player2_user_id;

      game.status = GameStatus.CLOSED;
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
}
