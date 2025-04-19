import { ApiProperty } from '@nestjs/swagger';
import { Game } from '../../games/game.entity';

export class QueueJoinResponse {
  @ApiProperty({
    example: true,
    description: 'Whether the operation was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'Joined queue successfully',
    description: 'Status message',
  })
  message: string;
}

export class QueueStatusResponse {
  @ApiProperty({
    type: Object,
    description: 'Game object if match found, empty array otherwise',
    nullable: true,
  })
  Game: Game | [];

  @ApiProperty({
    example: 30,
    description: 'Time spent in queue in seconds',
  })
  SecondsInQueue: number;

  @ApiProperty({
    example: true,
    description: 'Whether the operation was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'No pair found in queue',
    description: 'Status message',
  })
  message: string;
}
