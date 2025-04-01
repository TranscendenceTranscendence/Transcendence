import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Blocked } from '../../blockeds/blocked.entity';
import { User } from '../../users/user.entity';

export class CreateBlockedDto extends PartialType(Blocked) {
  @ApiProperty({ description: 'blocked_time' })
  @IsDate()
  blocked_time: Date;

  @ApiProperty({ description: 'blocked_user_id' })
  blockedUser: User;
}
