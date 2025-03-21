import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Worker } from 'worker_threads';
import { GameStatus } from './game.entity';
import { GamesService } from './games.service';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: true })
@Injectable()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private gameWorker: Worker;

  constructor(private readonly gamesService: GamesService) {
    this.gameWorker = new Worker('./src/games/game.worker.js');

    this.gameWorker.on('message', (gameState) => {
      this.server.emit('gameUpdate', gameState);
    });
  }

  handleConnection(client: Socket) {
    console.log(`Player connected: ${client.id}`);
    client.emit('message', 'Welcome to Pong!');
  }

  handleDisconnect(client: Socket) {
    console.log(`Player disconnected: ${client.id}`);
  }

  @SubscribeMessage('playerMove')
  handlePlayerMove(client: Socket, moveData: any) {
    this.gameWorker.postMessage({ type: 'playerMove', data: moveData });
  }

  @SubscribeMessage('startGame')
  startTheGame() {
    this.gameWorker.postMessage({ type: 'startGame' });
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(client: Socket, data: any): Promise<void> {
    const { roomId } = data;
    client.join(roomId);

    // Check if this is the second player (game can start)
    const room = this.server.sockets.adapter.rooms.get(roomId);

    if (room && room.size === 2) {
      try {
        // Get the game from the database to check its status
        const game = await this.gamesService.findByRoomIdentifier(roomId);

        if (game && game.status === GameStatus.PENDING) {
          game.status = GameStatus.COUNTDOWN;
          await this.gamesService.updateGameStatus(
            game.id,
            GameStatus.COUNTDOWN,
          );
          this.startCountdown(roomId);
        }
      } catch (error) {
        console.error(`Error checking game status for room ${roomId}:`, error);
      }
    }
  }

  private startCountdown(roomId: string): void {
    let count = 5;

    this.server.to(roomId).emit('countdown', count);

    const interval = setInterval(async () => {
      count--;

      if (count > 0) {
        this.server.to(roomId).emit('countdown', count);
      } else {
        clearInterval(interval);
        this.server.to(roomId).emit('gameStart');

        // Update game status in database
        try {
          const game = await this.gamesService.findByRoomIdentifier(roomId);

          if (game) {
            // Update status to ONGOING
            game.status = GameStatus.ONGOING;
            await this.gamesService.updateGameStatus(
              game.id,
              GameStatus.ONGOING,
            );
            console.log(`Game ${roomId} status updated to ONGOING`);
          }
        } catch (error) {
          console.error(
            `Error updating game status for room ${roomId}:`,
            error,
          );
        }

        // Start the game logic
        this.startGame(roomId);
      }
    }, 1000);
  }

  private startGame(roomId: string): void {
    const initialState = {
      ball: { x: 400, y: 300, vx: 5, vy: 5 },
      paddles: { player1: 150, player2: 150 },
      score: [0, 0],
    };

    // Send initial game state
    this.server.to(roomId).emit('gameState', initialState);

    // Begin game loop
    this.gameWorker.postMessage({ type: 'startGame', roomId });
  }
}
