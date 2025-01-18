import { ApiProperty } from '@nestjs/swagger';
import { Friend } from '../friend.entity';


export class GetFriendRequestsDto {
    @ApiProperty({ type: [Friend], description: 'The list of friend requests.' })
    data: Friend[];

    @ApiProperty({ type: 'number', description: 'The total number of friend requests.' })
    total: number;

    @ApiProperty({ type: 'number', description: 'The current page number.' })
    page: number;

    @ApiProperty({ type: 'number', description: 'The number of requests per page.' })
    pageSize: number;

    @ApiProperty({ type: 'number', description: 'The total number of pages.' })
    totalPages: number;
}