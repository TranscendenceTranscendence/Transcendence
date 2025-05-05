import { Controller, Get, Post, UseGuards, Req, Delete } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JwtAccessAuthGuard } from '../auth/guards/jwt-access.guard';
import { AuthenticatedRequest } from '../auth/guards/jwt-access.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  QueueJoinResponse,
  QueueStatusResponse,
  QueueUserInQueueResponse,
} from './dto/queue-responses.dto';

@ApiTags('Queue')
@ApiBearerAuth()
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('join')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Join queue' })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined queue',
    type: QueueJoinResponse,
  })
  async joinQueue(
    @Req() req: AuthenticatedRequest,
  ): Promise<QueueJoinResponse> {
    const success = await this.queueService.addToQueue(req.user.id);
    return {
      success,
      message: success ? 'Joined queue successfully' : 'Already in queue',
    };
  }

  @Delete('leave')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Leave queue' })
  @ApiResponse({
    status: 200,
    description: 'Successfully left queue',
    type: QueueJoinResponse,
  })
  async leaveQueue(
    @Req() req: AuthenticatedRequest,
  ): Promise<QueueJoinResponse> {
    const success = await this.queueService.removeFromQueue(req.user.id);
    return {
      success,
      message: success ? 'Left queue successfully' : 'Not in queue',
    };
  }

  @Get('status')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Get queue status' })
  @ApiResponse({
    status: 200,
    description: 'Queue status retrieved',
    type: QueueStatusResponse,
  })
  async getQueueStatus(
    @Req() req: AuthenticatedRequest,
  ): Promise<QueueStatusResponse> {
    const time = await this.queueService.getTimeInQueue(req.user.id);

    if (await this.queueService.moreThan2()) {
      const game = await this.queueService.removePair();
      return {
        Game: game,
        SecondsInQueue: time,
        success: true,
        message: 'Pair found in queue',
      };
    }
    return {
      Game: [],
      SecondsInQueue: time,
      success: true,
      message: 'No pair found in queue',
    };
  }

  @Get('isInQueue')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: 'Check if user is in queue' })
  @ApiResponse({
    status: 200,
    description: 'User is in queue',
    type: QueueUserInQueueResponse,
  })
  async isInQueue(
    @Req() req: AuthenticatedRequest,
  ): Promise<QueueUserInQueueResponse> {
    const isInQueue = await this.queueService.isPersonInQueue(req.user.id);
    return {
      isInQueue,
    };
  }
}
