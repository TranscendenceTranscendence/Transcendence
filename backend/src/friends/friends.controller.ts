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
import { JwtAccessAuthGuard } from "../auth/guards/jwt-access.guard";
import RequestWithUser from '../auth/interfaces/requestWithUser.interface';

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
  @ApiResponse({
    status: 409,
    description: 'Friend request already exists.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @UseGuards(JwtAccessAuthGuard)
  async sendFriendRequest(
    @Param('id', ParseIntPipe) receiverId: number,
    @Req() req: RequestWithUser,
  ) {
    try {
      console.log('Sending friend request:', {
        senderId: req.user?.id,
        receiverId: receiverId
      });

      const senderId = req.user?.id;
      if (!senderId) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      await this.friendsService.sendFriendRequest({ receiverId, senderId });
      
      return {
        success: true,
        message: 'Friend request sent successfully.',
      };
    } catch (error) {
      console.error('Error sending friend request:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to send friend request',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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
