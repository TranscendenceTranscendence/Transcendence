import { PickType } from '@nestjs/mapped-types';
import { User } from '../../users/user.entity';

export class UserDto extends PickType(User, [
  'id',
  'avatar',
  'nickname',
  'email',
  'user_status',
] as const) {}
