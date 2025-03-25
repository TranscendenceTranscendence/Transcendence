import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GamesService } from './games.service';
import { Game, GameStatus } from './game.entity';

interface Player {
  id: string;
  y: number;
  x: number;
}

// Update the GameState interface to include score
interface GameState {
  id: string;
  ball: { x: number; y: number; dx: number; dy: number };
  players: Record<string, Player>;
  score: [number, number]; // Add score tracking
}

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private playerToRoom = new Map<string, string>(); // Map player IDs to room IDs
  private socketToUserId = new Map<string, number>(); // Map socket IDs to user IDs

  constructor(
    private readonly gamesService: GamesService, // Inject GamesService
  ) {}
  private games = new Map<string, GameState>(); // Stores game states by gameId
  private gameLoops = new Map<string, NodeJS.Timeout>(); // Stores game loops by gameId

  handleConnection(client: Socket): void {
    console.log(`Player connected: ${client.id})`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Player disconnected: ${client.id}`);
    this.removePlayerFromGame(client);
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(client: Socket, data: any) {
    try {
      // Extract gameId from input (handle both string and object formats)
      const gameId = typeof data === 'object' ? data.gameId : data;

      console.log('Received joinGame event with data:', data);
      // Check if gameId is valid
      if (!gameId || gameId === undefined) {
        console.error('No gameId provided');
        return;
      }

      console.log('GAME ID HAS BEEN PROVIDED', gameId);

      // Create game first if it doesn't exist
      let game = this.games.get(gameId);
      if (!game) {
        game = this.createGame(gameId);
        console.log(`Created new WebSocket game: ${gameId}`);
      }

      // Now we can safely log players
      console.log('Current players in room:', Object.keys(game.players).length);
      console.log(`Player ${client.id} joining game ${gameId}`);

      // Store player associations
      this.playerToRoom.set(client.id, gameId);
      this.socketToUserId.set(client.id, 1);

      // Join the socket.io room
      client.join(gameId);

      // Add player to WebSocket game state
      const x = Object.keys(game.players).length === 0 ? 5 : 95; // Set x position based on number of players
      game.players[client.id] = { id: client.id, y: 50, x };

      // Check the database game entity
      try {
        // Find game in database
        const dbGame = await this.gamesService.findByRoomIdentifier(gameId);

        // Send initial game state to the client
        this.server.to(client.id).emit('update', game);

        
        // If game is ready to start (two players), update status and start countdown
        console.log('DB GAME',  Object.keys(game.players).length, dbGame, dbGame.status);
        if (
          Object.keys(game.players).length === 2 &&
          dbGame &&
          dbGame.status === GameStatus.PENDING
        ) {
          // Start countdown
          this.startCountdown(gameId);
        }
      } catch (error) {
        console.error(`Error fetching game from database: ${error.message}`);

        // Still send the game state even if database fetch fails
        this.server.to(client.id).emit('update', game);
      }

      console.log(`Player ${client.id} joined game ${gameId}`);
    } catch (error) {
      console.error(`Error in handleJoinGame: ${error.message}`);
    }
  }

  // Add countdown functionality
  private startCountdown(gameId: string) {
    let count = 3;
    console.log("INSIDE START COUNTDOWN: ", gameId);
    const countdownInterval = setInterval(() => {
      this.server.to(gameId).emit('countdown', count);

      if (count <= 0) {
        clearInterval(countdownInterval);
        this.server.to(gameId).emit('gameStart');
      }

      count--;
    }, 1000);
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
      score: [0, 0], // Initialize score
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

    // Paddle collision detection - keep your existing code
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

    // Scoring logic - update to track scores
    if (ball.x < 0) {
      // Player 2 scores
      game.score[1]++;
      this.resetBall(ball);
      this.updateScoreInDatabase(gameId, game.score);
    } else if (ball.x > 100) {
      // Player 1 scores
      game.score[0]++;
      this.resetBall(ball);
      this.updateScoreInDatabase(gameId, game.score);
    }
    if (game.score[0] == 11 || game.score[1] == 11) {
      try {
        this.gamesService.updateGameStatus(gameId, GameStatus.CLOSED);
      }
      catch (error) {
        console.error(`Error updating game status in database: ${error.message}`);
      }
      this.cleanupGame(gameId);
    }
  }

  private resetBall(ball: { x: number; y: number; dx: number; dy: number }) {
    ball.x = 50;
    ball.y = 50;
    ball.dx = ball.dx > 0 ? -1.5 : 1.5;
  }

  private async updateScoreInDatabase(gameId: string, score: [number, number]) {
    try {
      await this.gamesService.updateGameScore(gameId, score);
      // console.log(`Score updated in database for game ${gameId}: ${score}`);
    } catch (error) {
      console.error(`Error updating score in database: ${error.message}`);
    }
  }

  private removePlayerFromGame(client: Socket) {
    // Get the game this player was in
    const gameId = this.playerToRoom.get(client.id);
    if (!gameId) return;

    // Remove from our player tracking
    this.playerToRoom.delete(client.id);
    this.socketToUserId.delete(client.id);

    // Remove from the game
    const game = this.games.get(gameId);
    if (game && game.players[client.id]) {
      delete game.players[client.id];
      client.leave(gameId);
      console.log(`Player ${client.id} left game ${gameId}`);

      if (Object.keys(game.players).length === 0) {
        try {
          this.gamesService.updateGameStatus(gameId, GameStatus.CANCELLED);
        }
        catch (error) {
          console.error(`Error updating game status in database: ${error.message}`);
        }
        this.cleanupGame(gameId);
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
