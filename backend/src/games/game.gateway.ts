import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GamesService } from './games.service';

interface Player {
  id: string;
  playerNumber: number;
  y: number;
  x: number;
}

interface GameState {
  id: string;
  ball: { x: number; y: number; dx: number; dy: number };
  players: Record<string, Player>;
  score: [number, number];
  countdownActive: boolean;
}

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private playerToRoom = new Map<string, string>();
  private socketToUserId = new Map<string, number>();
  private userIdToSocket = new Map<number, string>();

  constructor(private readonly gamesService: GamesService) {}
  private games = new Map<string, GameState>();
  private gameLoops = new Map<string, NodeJS.Timeout>();

  handleConnection(client: Socket): void {
    void client;
  }

  handleDisconnect(client: Socket) {
    this.removePlayerFromGame(client);
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(client: Socket, data: any) {
    try {
      const roomId = typeof data === 'object' ? data.roomId : data;
      const userId = typeof data === 'object' ? data.userId : null;
      const playerNumber = typeof data === 'object' ? data.playerNumber : -1;

      if (
        !roomId ||
        roomId === undefined ||
        playerNumber > 1 ||
        playerNumber < 0
      ) {
        console.error('Invalid roomId or playerNumber');
        return;
      }

      let game = this.games.get(roomId);
      if (!game) {
        game = this.createGame(roomId);
      }

      if (userId && this.userIdToSocket.has(userId)) {
        console.error('User is already connected to a game');
        this.server.to(client.id).emit('alreadyConnected');
        return;
      }

      if (
        Object.keys(game.players).length >= 2 ||
        this.playerToRoom.has(client.id)
      ) {
        console.error('Game is full or player already in a game');
        return;
      }
      this.playerToRoom.set(client.id, roomId);
      this.socketToUserId.set(client.id, userId);
      this.userIdToSocket.set(userId, client.id);

      client.join(roomId);

      const x = playerNumber == 0 ? 5 : 95;
      game.players[client.id] = {
        id: client.id,
        playerNumber: playerNumber,
        y: 50,
        x,
      };

      try {
        const dbGame = await this.gamesService.findByRoomIdentifier(roomId);

        this.server.to(client.id).emit('update', game);
        if (
          Object.keys(game.players).length == 2 &&
          dbGame.status == 'countdown'
        )
          this.startCountdown(roomId);
      } catch (error) {
        console.error(`Error fetching game from database: ${error.message}`);
        this.server.to(client.id).emit('update', game);
      }
    } catch (error) {
      console.error(`Error in handleJoinGame: ${error.message}`);
    }
  }

  private startCountdown(roomId: string) {
    let count = 5;
    const game = this.games.get(roomId);
    if (!game || game.countdownActive) return;

    game.countdownActive = true;

    const countdownInterval = setInterval(() => {
      this.server.to(roomId).emit('countdown', count);

      if (count <= -1) {
        clearInterval(countdownInterval);

        this.gamesService
          .startGame(roomId)
          .then(() => {
            game.countdownActive = false;

            this.startGameLoop(roomId);
            this.server.to(roomId).emit('gameStart');
          })
          .catch((error) => {
            console.error(`Error updating game status: ${error.message}`);
            game.countdownActive = false;

            this.startGameLoop(roomId);
            this.server.to(roomId).emit('gameStart');
          });
      }

      count--;
    }, 1000);
  }

  @SubscribeMessage('move')
  handleMove(client: Socket, { roomId, y }: { roomId: string; y: number }) {
    void client;
    const game = this.games.get(roomId);
    if (game && game.players[client.id]) {
      game.players[client.id].y = y;
    }
  }

  private createGame(roomId: string): GameState {
    const game: GameState = {
      id: roomId,
      ball: { x: 50, y: 50, dx: 1.5, dy: 1.5 },
      players: {},
      score: [0, 0],
      countdownActive: false,
    };

    this.games.set(roomId, game);
    return game;
  }

  private startGameLoop(roomId: string) {
    const loop = setInterval(() => {
      this.updateGame(roomId);
      this.server.to(roomId).emit('update', this.games.get(roomId));
    }, 1000 / 60);

    this.gameLoops.set(roomId, loop);
  }

  private updateGame(roomId: string) {
    const game = this.games.get(roomId);
    if (!game) return;

    const { ball, players } = game;

    const prevX = ball.x;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y <= 0 || ball.y >= 100) ball.dy *= -1;

    // let paddleCollision = false;

    Object.values(players).forEach((player) => {
      const isLeftPaddle = player.playerNumber === 0;
      const isRightPaddle = player.playerNumber === 1;

      const paddleX = player.x;
      const paddleY = player.y;
      const paddleWidth = 1.5;
      const paddleHeight = 14;

      const crossedLeftPaddle =
        prevX > paddleX && ball.x <= paddleX && isLeftPaddle;
      const crossedRightPaddle =
        prevX < paddleX && ball.x >= paddleX && isRightPaddle;

      const isAtPaddleHeight = Math.abs(paddleY - ball.y) < paddleHeight / 2;

      if ((crossedLeftPaddle || crossedRightPaddle) && isAtPaddleHeight) {
        // paddleCollision = true;

        ball.dx *= -1.05;

        if (isLeftPaddle) {
          ball.x = paddleX + paddleWidth / 2 + 0.5;
        } else {
          ball.x = paddleX - paddleWidth / 2 - 0.5;
        }

        const hitPosition = (ball.y - paddleY) / (paddleHeight / 2);
        ball.dy = ball.dy * 0.5 + hitPosition * 2;

        const maxSpeed = 2.0;
        const minSpeed = 0.5;
        if (Math.abs(ball.dy) > maxSpeed)
          ball.dy = Math.sign(ball.dy) * maxSpeed;
        if (Math.abs(ball.dy) < minSpeed)
          ball.dy = Math.sign(ball.dy) * minSpeed;
      }
    });

    if (ball.x < 0) {
      ++game.score[1];
      this.resetBall(ball);
      this.updateScoreInDatabase(roomId, game.score);
    } else if (ball.x > 100) {
      ++game.score[0];
      this.resetBall(ball);
      this.updateScoreInDatabase(roomId, game.score);
    }

    if (game.score[0] >= 1111 || game.score[1] >= 1111) {
      try {
        this.updateScoreInDatabase(roomId, game.score);
        this.gamesService.closeGame(roomId);
      } catch (error) {
        console.error(
          `Error updating game status in database: ${error.message}`,
        );
      }
      this.cleanupGame(roomId);
      this.server.to(roomId).emit('removePlayer');
    }
  }

  private resetBall(ball: { x: number; y: number; dx: number; dy: number }) {
    ball.x = 50;
    ball.y = 50;

    ball.dx = 0;
    ball.dy = 0;

    setTimeout(() => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      ball.dx = direction * 1.5;
      ball.dy = (Math.random() * 2 - 1) * 1.5;
    }, 1000);
  }

  private async updateScoreInDatabase(roomId: string, score: [number, number]) {
    try {
      await this.gamesService.updateGameScore(roomId, score);
    } catch (error) {
      console.error(`Error updating score in database: ${error.message}`);
    }
  }

  private removePlayerFromGame(client: Socket) {
    const roomId = this.playerToRoom.get(client.id);
    if (!roomId) return;

    this.playerToRoom.delete(client.id);
    const userId = this.socketToUserId.get(client.id);
    this.socketToUserId.delete(client.id);
    if (userId) {
      this.userIdToSocket.delete(userId);
    }

    const game = this.games.get(roomId);
    if (game && game.players[client.id]) {
      delete game.players[client.id];
      client.leave(roomId);

      if (Object.keys(game.players).length === 0) {
        try {
          this.gamesService.cancelGame(roomId);
        } catch (error) {
          console.error(
            `Error updating game status in database: ${error.message}`,
          );
        }
        this.cleanupGame(roomId);
        this.server.to(roomId).emit('removePlayer');
      }
    }
  }

  private cleanupGame(roomId: string) {
    clearInterval(this.gameLoops.get(roomId));
    this.gameLoops.delete(roomId);
    this.games.delete(roomId);
  }
}
