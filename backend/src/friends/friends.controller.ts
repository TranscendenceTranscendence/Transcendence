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
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { GetFriendRequestsDto } from './dto/get-friend-requests.dto';
import { JwtAccessAuthGuard } from '../auth/guards/jwt-access.guard';

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
    @Req() req: Request,
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
  async getFriendRequests(@Req() req: Request) {
    const receiverId = req.user?.id; // Ensure type safety for `req.user`
    console.log(receiverId);
    if (!receiverId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const friendRequests = await this.friendsService.getFriendRequests({
      receiverId,
    });

    return {
      success: true,
      data: friendRequests,
    };
  }
}
