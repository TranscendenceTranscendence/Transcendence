import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  IsDate,
} from 'class-validator';
import { InviteStatus } from '../invite.entity';

export class CreateInviteDto {
  @ApiProperty({
    description: 'The user ID of the receiver',
    example: 1,
    required: true,
  })
  @IsNumber()
  senderUserId: number;

  @ApiProperty({
    description: 'The user ID of the receiver',
    example: 1,
    required: true,
  })
  @IsNumber()
  receiverUserId: number;

  @ApiProperty({
    description: 'The status of the invite',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
    required: true,
  })
  @IsEnum(InviteStatus)
  @IsOptional()
  status?: InviteStatus;

  @ApiProperty({
    description: 'The game room identifier',
    example: 'room-uuid-123',
    required: false,
  })
  @IsString()
  @IsOptional()
  gameRoomId?: string;

  @ApiProperty({
    description: 'The date the invite was created',
    required: true,
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'The date the invite was expired at',
    required: false,
  })
  @IsDate()
  expiresAt: Date;
}
