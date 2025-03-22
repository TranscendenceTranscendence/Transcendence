import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface Player {
  id: string;
  y: number;
}

interface GameState {
  id: string;
  ball: { x: number; y: number; dx: number; dy: number };
  players: Record<string, Player>;
}

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private games = new Map<string, GameState>(); // Stores game states by gameId
  private gameLoops = new Map<string, NodeJS.Timeout>(); // Stores game loops by gameId

  handleConnection(client: Socket) {
    console.log(`Player connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Player disconnected: ${client.id}`);
    this.removePlayerFromGame(client);
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(client: Socket, { gameId }: { gameId: string }) {
    client.join(gameId);

    let game = this.games.get(gameId);

    if (!game) {
      game = this.createGame(gameId);
    }

    game.players[client.id] = { id: client.id, y: 50 };

    console.log(`Player ${client.id} joined game ${gameId}`);
  }

  @SubscribeMessage('move')
  handleMove(client: Socket, { gameId, y }: { gameId: string; y: number }) {
    const game = this.games.get(gameId);
    if (game && game.players[client.id]) {
      game.players[client.id].y = y;
    }
  }

  private createGame(gameId: string): GameState {
    const game: GameState = {
      id: gameId,
      ball: { x: 50, y: 50, dx: 1.5, dy: 1.5 },
      players: {},
    };

    this.games.set(gameId, game);
    this.startGameLoop(gameId);

    return game;
  }

  private startGameLoop(gameId: string) {
    const loop = setInterval(() => {
      this.updateGame(gameId);
      this.server.to(gameId).emit('update', this.games.get(gameId));
    }, 1000 / 60);

    this.gameLoops.set(gameId, loop);
  }

  private updateGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    const { ball, players } = game;
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y <= 0 || ball.y >= 100) ball.dy *= -1;

    Object.values(players).forEach((player) => {
      if (
        (player.id === Object.keys(players)[0] &&
          ball.x <= 5 &&
          Math.abs(player.y - ball.y) < 10) ||
        (player.id === Object.keys(players)[1] &&
          ball.x >= 95 &&
          Math.abs(player.y - ball.y) < 10)
      ) {
        ball.dx *= -1;
      }
    });

    if (ball.x < 0 || ball.x > 100) {
      ball.x = 50;
      ball.y = 50;
      ball.dx = ball.dx > 0 ? -1.5 : 1.5;
    }
  }

  private removePlayerFromGame(client: Socket) {
    for (const [gameId, game] of this.games) {
      if (game.players[client.id]) {
        delete game.players[client.id];
        client.leave(gameId);
        console.log(`Player ${client.id} left game ${gameId}`);

        if (Object.keys(game.players).length === 0) {
          this.cleanupGame(gameId);
        }
        break;
      }
    }
  }

  private cleanupGame(gameId: string) {
    clearInterval(this.gameLoops.get(gameId));
    this.gameLoops.delete(gameId);
    this.games.delete(gameId);
    console.log(`Game ${gameId} removed`);
  }
}
