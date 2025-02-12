import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto } from './create-game.dto';

export class UpdateGameDto extends PartialType(CreateGameDto) {
  // @ApiProperty({ description: 'person1 users' })
  // @IsNumber()
  // person1_user_id: DeepPartial<User>
  // @ApiProperty({ description: 'person2 users' })
  // @IsNumber()
  // person2_user_id: DeepPartial<User>
}
