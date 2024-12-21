// Queue Controller
import {
    Controller,
    Get,
    Post,
    Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QueueService } from './queue.service';

@ApiTags('Queue') // Groups the endpoints under "Queue" in Swagger
@Controller('queue')
export class QueueController {
    constructor(private readonly queueService: QueueService) {}

    @Post('join')
    @ApiOperation({ summary: 'Join the queue' })
    @ApiResponse({
        status: 200,
        description: 'Player successfully joined the queue.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid player ID.',
    })
    joinQueue(@Body('playerId') playerId: string): string {
        return this.queueService.joinQueue(playerId);
    }

    @Get('status')
    @ApiOperation({ summary: 'Get the current queue status' })
    @ApiResponse({
        status: 200,
        description: 'Queue status fetched successfully.',
    })
    getQueueStatus(): string {
        return this.queueService.getCurrentQueueStatus();
    }
}
