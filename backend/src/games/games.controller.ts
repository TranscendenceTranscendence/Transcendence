// Games Controller
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateGameDto } from './dto/create-game.dto';
import { GamesService } from './games.service';

@ApiTags('Games') // Groups the endpoints under "Games" in Swagger
@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new game' })
    @ApiResponse({
        status: 201,
        description: 'Game created successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request.',
    })
    async create(@Body() createGameDto: CreateGameDto) {
        try {
            await this.gamesService.create(createGameDto);
            return {
                success: true,
                message: 'Game Created Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Get()
    @ApiOperation({ summary: 'Retrieve all games' })
    @ApiResponse({
        status: 200,
        description: 'Games fetched successfully.',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error.',
    })
    async findAll() {
        try {
            const data = await this.gamesService.findAll();
            return {
                success: true,
                data,
                message: 'Games Fetched Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
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
}
