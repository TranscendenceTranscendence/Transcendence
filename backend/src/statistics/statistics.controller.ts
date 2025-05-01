import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  type AuthenticatedRequest,
  JwtAccessAuthGuard,
} from '../auth/guards/jwt-access.guard';
import { StatisticsService } from './statistics.service';
import { PlayerStatisticsDto } from './dto/statistics.dto';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(
    @Inject(StatisticsService)
    private readonly statisticsService: StatisticsService,
  ) {}

  @Get()
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Get current player statistics' })
  @ApiResponse({
    status: 200,
    description: 'Player statistics retrieved successfully.',
    type: PlayerStatisticsDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve player statistics.',
  })
  async getCurrentPlayerStatistics(
    @Req() req: AuthenticatedRequest,
  ): Promise<PlayerStatisticsDto> {
    const userId = req.user.id;
    try {
      const response = await this.statisticsService.getPlayerStatistics(userId);
      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve player statistics: ' + error.message,
      );
    }
  }
  @Get(':id')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Get player statistics by id' })
  @ApiResponse({
    status: 200,
    description: 'Player statistics retrieved successfully.',
    type: PlayerStatisticsDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve player statistics.',
  })
  async getPlayerStatisticsById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<PlayerStatisticsDto> {
    try {
      const response = await this.statisticsService.getPlayerStatistics(userId);
      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve player statistics: ' + error.message,
      );
    }
  }
}
