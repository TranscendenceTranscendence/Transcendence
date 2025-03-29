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
  playerNumber: number;
  y: number;
  x: number;
}

// Update the GameState interface to include score
interface GameState {
  id: string;
  ball: { x: number; y: number; dx: number; dy: number };
  players: Record<string, Player>;
  score: [number, number];
  countdownActive?: boolean;
}

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private playerToRoom = new Map<string, string>(); // Map player IDs to room IDs
  private socketToUserId = new Map<string, number>(); // Map socket IDs to user IDs

  constructor(
    private readonly gamesService: GamesService, // Inject GamesService
  ) {}
  private games = new Map<string, GameState>(); // Stores game states by roomId
  private gameLoops = new Map<string, NodeJS.Timeout>(); // Stores game loops by roomId

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
      // Extract roomId from input (handle both string and object formats)
      const roomId = typeof data === 'object' ? data.roomId : data;
      const userId = typeof data === 'object' ? data.userId : null;
      const playerNumber = typeof data === 'object' ? data.playerNumber : -1;

      console.log('Received joinGame event with data:', data);
      // Check if roomId is valid
      if (!roomId || roomId === undefined || playerNumber === -1) {
        console.error('Invalid roomId or playerNumber');
        return;
      }

      console.log('GAME ID HAS BEEN PROVIDED', roomId);

      // Create game first if it doesn't exist
      let game = this.games.get(roomId);
      if (!game) {
        game = this.createGame(roomId);
        console.log(`Created new WebSocket game: ${roomId}`);
      }

      // Now we can safely log players
      console.log('Current players in room:', Object.keys(game.players).length);
      console.log(`Player ${client.id} joining game ${roomId}`);
      if (
        Object.keys(game.players).length >= 2 ||
        this.playerToRoom.has(client.id)
      ) {
        console.error('Game is full or player already in a game');
        return;
      }
      // Store player associations
      this.playerToRoom.set(client.id, roomId);
      this.socketToUserId.set(client.id, userId);

      // Join the socket.io room
      client.join(roomId);

      // Add player to WebSocket game state
      console.log(`Adding player ${client.id} to playernumber ${playerNumber}`);
      const x = playerNumber == 0 ? 5 : 95;
      game.players[client.id] = {
        id: client.id,
        playerNumber: playerNumber,
        y: 50,
        x,
      };

      // Check the database game entity
      try {
        // Find game in database
        const dbGame = await this.gamesService.findByRoomIdentifier(roomId);

        // Send initial game state to the client
        this.server.to(client.id).emit('update', game);

        // If game is ready to start (two players), update status and start countdown
        console.log(
          'DB GAME',
          Object.keys(game.players).length,
          dbGame,
          dbGame.status,
        );
        if (
          Object.keys(game.players).length === 2 &&
          dbGame &&
          dbGame.status === GameStatus.PENDING
        ) {
          // Start countdown
          this.startCountdown(roomId);
        }
      } catch (error) {
        console.error(`Error fetching game from database: ${error.message}`);

        // Still send the game state even if database fetch fails
        this.server.to(client.id).emit('update', game);
      }

      console.log(`Player ${client.id} joined game ${roomId}`);
    } catch (error) {
      console.error(`Error in handleJoinGame: ${error.message}`);
    }
  }

  // Add countdown functionality
  private startCountdown(roomId: string) {
    let count = 3;
    console.log('Starting countdown for game:', roomId);

    // Mark the game as in countdown to prevent multiple countdowns
    const game = this.games.get(roomId);
    if (!game || game.countdownActive) return;

    // Add a flag to prevent multiple countdowns
    game.countdownActive = true;

    const countdownInterval = setInterval(() => {
      this.server.to(roomId).emit('countdown', count);
      console.log(`Game ${roomId} countdown: ${count}`);

      if (count <= 0) {
        clearInterval(countdownInterval);

        // Update game status in database to ACTIVE
        this.gamesService
          .startGame(roomId)
          .then(() => {
            console.log(`Game ${roomId} started successfully`);
            // Start the actual game physics after countdown
            this.server.to(roomId).emit('gameStart');
            game.countdownActive = false;
          })
          .catch((error) => {
            console.error(`Error updating game status: ${error.message}`);
            this.server.to(roomId).emit('gameStart'); // Still start the game
            game.countdownActive = false;
          });
      }

      count--;
    }, 1000);
  }

  @SubscribeMessage('move')
  handleMove(client: Socket, { roomId, y }: { roomId: string; y: number }) {
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
      score: [0, 0], // Initialize score
    };

    this.games.set(roomId, game);
    this.startGameLoop(roomId);

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
      ++game.score[1];
      this.resetBall(ball);
      this.updateScoreInDatabase(roomId, game.score);
    } else if (ball.x > 100) {
      // Player 1 scores
      ++game.score[0];
      this.resetBall(ball);
      this.updateScoreInDatabase(roomId, game.score);
    }

    if (game.score[0] == 11 || game.score[1] == 11) {
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
    ball.dx = ball.dx > 0 ? -1.5 : 1.5;
  }

  private async updateScoreInDatabase(roomId: string, score: [number, number]) {
    try {
      await this.gamesService.updateGameScore(roomId, score);
      // console.log(`Score updated in database for game ${roomId}: ${score}`);
    } catch (error) {
      console.error(`Error updating score in database: ${error.message}`);
    }
  }

  private removePlayerFromGame(client: Socket) {
    // Get the game this player was in
    const roomId = this.playerToRoom.get(client.id);
    if (!roomId) return;

    // Remove from our player tracking
    this.playerToRoom.delete(client.id);
    this.socketToUserId.delete(client.id);

    // Remove from the game
    const game = this.games.get(roomId);
    if (game && game.players[client.id]) {
      delete game.players[client.id];
      client.leave(roomId);
      console.log(`Player ${client.id} left game ${roomId}`);

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
    console.log(`Game ${roomId} removed`);
  }
}
