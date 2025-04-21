import { Injectable } from '@nestjs/common';
import { GamesService } from '../games/games.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateGameDto } from '../games/dto/create-game.dto';
import { Game, GameStatus } from '../games/game.entity';

interface QueueEntry {
  userId: number;
  timeJoined: Date;
}

@Injectable()
export class QueueService {
  private queues: QueueEntry[] = []; // Initialize the array!

  constructor(private readonly gamesService: GamesService) {} // Proper injection

  async moreThan2(): Promise<boolean> {
    return this.queues.length > 1;
  }

  async getTimeInQueue(userId: number): Promise<number> {
    const queue = this.queues.find((q) => q.userId === userId);
    if (queue) {
      const timeInQueue = new Date().getTime() - queue.timeJoined.getTime();
      return timeInQueue;
    }
    return 0;
  }

  async removePair(): Promise<Game> {
    if (await this.moreThan2()) {
      const player1 = this.queues.pop().userId;
      const player2 = this.queues.pop().userId;
      const game = new CreateGameDto();
      const identifier = uuidv4();
      game.room_identifier = identifier;
      game.player1_user_id = player1;
      game.player2_user_id = player2;
      game.status = GameStatus.PENDING;
      game.created_at = new Date();
      game.score = [0, 0];
      game.winner_user_id = 0;

      const gameEntity = await this.gamesService.create(game);
      return gameEntity;
    }
    return null;
  }

  async addToQueue(userId: number): Promise<boolean> {
    const existingQueue = this.queues.find((queue) => queue.userId === userId);
    if (existingQueue) {
      return false;
    }
    this.queues.push({ userId, timeJoined: new Date() });
    return true;
  }

  async isPersonInQueue(userId: number): Promise<boolean> {
    return this.queues.some((queue) => queue.userId === userId);
  }

  async removeFromQueue(userId: number): Promise<boolean> {
    const initialLength = this.queues.length;
    this.queues = this.queues.filter((queue) => queue.userId !== userId);
    return initialLength !== this.queues.length;
  }
}
