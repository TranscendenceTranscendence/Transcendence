// Friends Controller
import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../common/gaurds/jwt-auth.gaurd';
import { GetFriendRequestsDto } from './dto/get-friend-requests.dto';


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
  @UseGuards(JwtAuthGuard)
  async sendFriendRequest(@Param('id') recieverId: number, @Req() req: Request) {
    try {
      const senderId = req.user.id;
      await this.friendsService.sendFriendRequest({
        recieverId,
        senderId
      })
      return {
        success: true,
        message: 'Friend Request send Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }



  @Get('requests/')
  @ApiOperation({ summary: "Get all open requests for current user" })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched friend requests.',
    type: GetFriendRequestsDto,
  })
  @UseGuards(JwtAuthGuard)
  async getFriendRequests(@Req() req: Request) {
    return this.friendsService.getFriendRequests({
      recieverId: req.user.id
    })
  }


}
