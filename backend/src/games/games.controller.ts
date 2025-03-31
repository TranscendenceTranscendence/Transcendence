// Games Controller
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateGameDto } from './dto/create-game.dto';
import { GamesService } from './games.service';
import { JwtAccessAuthGuard } from '../auth/guards/jwt-access.guard';
import { AuthenticatedRequest } from '../auth/guards/jwt-access.guard';
import { Game } from './game.entity';

@ApiTags('Games') // Groups the endpoints under "Games" in Swagger
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({
    status: 201,
    description: 'Game created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.',
  })
  async create(
    @Body() createGameDto: CreateGameDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      createGameDto.player1_user_id = req.user.id;
      const game = await this.gamesService.create(createGameDto);

      return {
        success: true,
        data: game,
        message: 'Game Created Successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post(':id/join')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Join an existing game' })
  @ApiResponse({
    status: 200,
    description: 'Game joined successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Game is full or player already in a game.',
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found.',
  })
  async joinGame(
    @Param('id') gameId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Game> {
    try {
      const game = await this.gamesService.joinGame(gameId, req.user.id);
      return game;
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Retrieve all games' })
  @ApiResponse({
    status: 200,
    description: 'Games fetched successfully.',
    type: [Game],
  })
  async findAll(): Promise<Game[]> {
    try {
      const games = await this.gamesService.findAll();
      return games || [];
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  }

  @Get('available')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: "Retrieve all available games except current user's",
  })
  @ApiResponse({
    status: 200,
    description: 'Games fetched successfully.',
    type: [Game],
  })
  async findAllExceptUser(@Req() req: AuthenticatedRequest): Promise<Game[]> {
    try {
      const games = await this.gamesService.findAllExceptUser(req.user.id);
      return games;
    } catch (error) {
      console.error('Error fetching available games:', error);
      throw error;
    }
  }

  @Get('current')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Retrieve current game for current user' })
  @ApiResponse({
    status: 200,
    description: 'Game fetched successfully or null if no game found.',
    type: Game,
  })
  async findCurrentGame(@Req() req: AuthenticatedRequest): Promise<Game | []> {
    try {
      const game = await this.gamesService.isPlayerInGame(req.user.id);
      if (!game) {
        return [];
      }
      return game;
    } catch (error) {
      console.error('Error finding current game:', error);
      return [];
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a game by ID' })
  @ApiResponse({
    status: 200,
    description: 'Game fetched successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found.',
  })
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.gamesService.findByUserId(+id);
      return {
        success: true,
        data,
        message: 'Game Fetched Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a game by ID' })
  @ApiResponse({
    status: 200,
    description: 'Game deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found.',
  })
  async remove(@Param('id') id: string) {
    try {
      await this.gamesService.remove(+id);
      return {
        success: true,
        message: 'Game Deleted Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('room/:roomIdentifier')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Retrieve a game by room identifier' })
  @ApiResponse({
    status: 200,
    description: 'Game fetched successfully.',
    type: Game,
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied: You are not a participant in this game',
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found.',
  })
  async findByRoomIdentifier(
    @Param('roomIdentifier') roomIdentifier: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Game | []> {
    try {
      const game = await this.gamesService.findByRoomIdentifier(roomIdentifier);

      try {
        const isUserInGame = await this.gamesService.checkIfUserInCurrentGame(
          req.user.id,
          roomIdentifier,
        );

        if (!isUserInGame) {
          console.warn(`User ${req.user.id} is not in game ${roomIdentifier}`);
          return [];
        }
      } catch (error) {
        console.warn(
          `Error checking if user ${req.user.id} is in game ${roomIdentifier}:`,
          error,
        );
        return [];
      }

      return game;
    } catch (error) {
      console.error(`Error finding game by room ID ${roomIdentifier}:`, error);
      throw error;
    }
  }
}
