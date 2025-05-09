import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { GetFriendRequestsDto } from './dto/get-friend-requests.dto';
import {
  AuthenticatedRequest,
  JwtAccessAuthGuard,
} from '../auth/guards/jwt-access.guard';

@ApiTags('Friends') // Groups the endpoints under "Friends" in Swagger
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('/requests/send/:id')
  @ApiOperation({ summary: 'Send a friend request by Id' })
  @ApiResponse({
    status: 200,
    description: 'Friend request sent successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @UseGuards(JwtAccessAuthGuard)
  async sendFriendRequest(
    @Param('id', ParseIntPipe) receiverId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const senderId = req.user?.id; // Type safety assumed for `req.user`
    if (!senderId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    await this.friendsService.sendFriendRequest({ receiverId, senderId });
    return {
      success: true,
      message: 'Friend request sent successfully.',
    };
  }

  @Get('/requests')
  @ApiOperation({ summary: 'Get all open requests for current user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched friend requests.',
    type: GetFriendRequestsDto,
  })
  @UseGuards(JwtAccessAuthGuard)
  async getFriendRequests(@Req() req: AuthenticatedRequest) {
    const receiverId = req.user?.id; // Ensure type safety for `req.user`
    if (!receiverId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const friendRequests = await this.friendsService.getFriendRequests({
      receiverId,
    });

    return friendRequests;
  }

  @Post('/requests/accept/:id')
  @ApiOperation({ summary: 'Accept a friend request by Id' })
  @ApiResponse({
    status: 200,
    description: 'Friend request accepted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @UseGuards(JwtAccessAuthGuard)
  async acceptFriendRequest(
    @Param('id', ParseIntPipe) senderId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const receiverId = req.user?.id; // Type safety assumed for `req.user`
    if (!receiverId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    await this.friendsService.acceptFriendRequest({ senderId, receiverId });
    return {
      success: true,
      message: 'Friend request accepted successfully.',
    };
  }

  @Get('/')
  @ApiOperation({ summary: 'Get all friends for current user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched friends.',
    type: GetFriendRequestsDto,
  })
  @UseGuards(JwtAccessAuthGuard)
  async getFriends(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id; // Ensure type safety for `req.user`
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const data = await this.friendsService.getFriends(userId);

    return {
      success: true,
      ...data,
    };
  }

  @Get('friend-status/:id')
  @ApiOperation({ summary: 'Get friendship status with a user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved friend status',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        friendStatus: {
          type: 'string',
          enum: ['pending', 'accepted', 'rejected', 'not_friends'],
        },
      },
    },
  })
  @UseGuards(JwtAccessAuthGuard)
  async getFriendStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const friendStatus = await this.friendsService.getFriendStatus(userId, id);

    return {
      success: true,
      friendStatus: friendStatus,
    };
  }
}
