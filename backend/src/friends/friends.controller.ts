// Friends Controller
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete, UseGuards, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateFriendDto } from './dto/create-friend.dto';
import { FriendsService } from './friends.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../common/gaurds/jwt-auth.gaurd';

@ApiTags('Friends') // Groups the endpoints under "Friends" in Swagger
@Controller('friends')
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) {}

    @Post('/send/:id')
    @ApiOperation({ summary: 'Delete a friend entry by ID' })
    @ApiResponse({
        status: 200,
        description: 'Friend request sent successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'User not found.',
    })
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string, @Req() req: Request) {
        try {
            const userId = req.user.id;
            await this.friendsService.remove(+id);
            return {
                success: true,
                message: 'Friend Deleted Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
}
