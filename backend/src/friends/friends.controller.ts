// Friends Controller
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { FriendsService } from './friends.service';

@ApiTags('Friends') // Groups the endpoints under "Friends" in Swagger
@Controller('friends')
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a friend entry' })
    @ApiResponse({
        status: 201,
        description: 'Friend created successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request.',
    })
    async create(@Body() createFriendDto: CreateFriendDto) {
        try {
            await this.friendsService.create(createFriendDto);
            return {
                success: true,
                message: 'Friend Created Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Get()
    @ApiOperation({ summary: 'Retrieve all friend entries' })
    @ApiResponse({
        status: 200,
        description: 'Friends fetched successfully.',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error.',
    })
    async findAll() {
        try {
            const data = await this.friendsService.findAll();
            return {
                success: true,
                data,
                message: 'Friends Fetched Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Retrieve a friend entry by ID' })
    @ApiResponse({
        status: 200,
        description: 'Friend fetched successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'Friend not found.',
    })
    async findOne(@Param('id') id: string) {
        try {
            const data = await this.friendsService.findByPersonUserId(+id);
            return {
                success: true,
                data,
                message: 'Friend Fetched Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a friend entry by ID' })
    @ApiResponse({
        status: 200,
        description: 'Friend deleted successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'Friend not found.',
    })
    async remove(@Param('id') id: string) {
        try {
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
