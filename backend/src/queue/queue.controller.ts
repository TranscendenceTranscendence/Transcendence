import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JwtAccessAuthGuard } from '../auth/guards/jwt-access.guard';
import { AuthenticatedRequest } from '../auth/guards/jwt-access.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Game } from 'games/game.entity';

@ApiTags('Queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('join')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Join queue' })
  @ApiResponse({ status: 200, description: 'Successfully joined queue' })
  async joinQueue(req: AuthenticatedRequest) {
    return this.queueService.addToQueue(req.user.id);
  }

  @Get('status')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Get queue status' })
  @ApiResponse({ status: 200, description: 'Queue status retrieved' })
  async getQueueStatus(req: AuthenticatedRequest): Promise<{
    Game: Game | [];
    SecondsInQueue: number;
    success: boolean;
    message: string;
  }> {
    const time = await this.queueService.getTimeInQueue(req.user.id);

    if (this.queueService.moreThan2()) {
      console.log('Found pair in queue');
      const game = await this.queueService.removePair();
      console.log('Game created: ', game);
      return {
        Game: game,
        SecondsInQueue: time,
        success: true,
        message: 'Pair found in queue',
      };
    }
    console.log('No pair found in queue');
    return {
      Game: [],
      SecondsInQueue: time,
      success: true,
      message: 'No pair found in queue',
    };
  }
}
