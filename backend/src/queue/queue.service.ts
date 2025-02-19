// queue.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class QueueService {
  private playerInQueue: string | null = null;

  joinQueue(playerId: string): string {
    if (this.playerInQueue === null) {
      this.playerInQueue = playerId;
      return ``;
    } else {
      const matchedPlayer = this.playerInQueue;
      this.playerInQueue = null;
      return `${matchedPlayer}`;
    }
  }

  getCurrentQueueStatus(): string {
    return this.playerInQueue
      ? `Current player in queue: ${this.playerInQueue}`
      : 'Queue is empty.';
  }
}
