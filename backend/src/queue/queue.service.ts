import { Injectable } from '@nestjs/common';
import { GamesService } from 'games/games.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateGameDto } from 'games/dto/create-game.dto';
import { Game, GameStatus } from 'games/game.entity';

interface queue {
  userId: number;
  timeJoined: Date;
}

@Injectable()
export class QueueService {
  private queues: queue[];
  private games: GamesService;
  constructor() {}

  async moreThan2(): Promise<boolean> {
    return this.queues.length > 1;
  }

  async getTimeInQueue(userId: number): Promise<number> {
    const queue = this.queues.find((q) => q.userId === userId);
    if (queue) {
      const timeInQueue = new Date().getTime() - queue.timeJoined.getTime();
      return Math.floor(timeInQueue / 1000);
    }
    return 0;
  }

  async removePair(): Promise<Game> {
    if (this.moreThan2()) {
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
      game.ended_at = null;
      game.winner_user_id = 0;
      const gameEntity = await this.games.create(game);
      return gameEntity;
    }
  }

  async addToQueue(userId: number): Promise<boolean> {
    const existingQueue = this.queues.find((queue) => queue.userId === userId);
    if (existingQueue) {
      return false;
    }
    this.queues.push({ userId, timeJoined: new Date() });

    return true;
  }
}
