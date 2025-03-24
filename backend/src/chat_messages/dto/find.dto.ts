import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class findChatMessageDto {
  @ApiProperty({ description: 'chatRoomId' })
  @IsNumber()
  @IsOptional()
  chatRoomId: number;

  @ApiProperty({ description: 'daysAgo' })
  @IsNumber()
  @IsOptional()
  daysAgo: number;
}
