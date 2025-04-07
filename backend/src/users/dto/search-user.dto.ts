import { ApiProperty } from '@nestjs/swagger';

export class SearchUserRequestDto {
  @ApiProperty({
    description: 'Search query for user nickname or email',
    required: true,
  })
  query: string;
}

export class SearchUserResponseDto {
  @ApiProperty({ description: 'ID of the user' })
  id: number;

  @ApiProperty({ description: 'Nickname of the user' })
  nickname: string;

  @ApiProperty({ description: 'Email of the user' })
  email: string;

  @ApiProperty({ description: 'Avatar URL of the user' })
  avatar: string;
}
