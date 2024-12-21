import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    ParseIntPipe,
    Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateChatRoomDto } from './dto/create-chat_room.dto';
import { UpdateChatRoomDto } from './dto/update-chat_room.dto';
import { ChatRoomsService } from './chat_rooms.service';

@ApiTags('ChatRooms') // Groups the endpoints under "ChatRooms" in Swagger
@Controller('chatroom')
export class ChatRoomsController {
    constructor(private readonly chatRoomsService: ChatRoomsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new chat room' })
    @ApiResponse({
        status: 201,
        description: 'Chat room created successfully.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data.',
    })
    async create(@Body() createChatRoomDto: CreateChatRoomDto) {
        try {
            await this.chatRoomsService.create(createChatRoomDto);
            return {
                success: true,
                message: 'ChatRoom Created Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get a list of all chat rooms' })
    @ApiResponse({
        status: 200,
        description: 'Chat rooms fetched successfully.',
    })
    async findAll() {
        try {
            const data = await this.chatRoomsService.findAll();
            return {
                success: true,
                data,
                message: 'ChatRoom Fetched Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Get('noPrivate')
    @ApiOperation({ summary: 'Get all public chat rooms' })
    @ApiResponse({
        status: 200,
        description: 'Public chat rooms fetched successfully.',
    })
    async findAllWithoutPrivate() {
        try {
            const data = await this.chatRoomsService.findAllWithoutPrivate();
            return {
                success: true,
                data,
                message: 'ChatRoom Fetched Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Get('includeParticipant')
    @ApiOperation({ summary: 'Get all chat rooms including participants' })
    @ApiResponse({
        status: 200,
        description: 'Chat rooms with participants fetched successfully.',
    })
    async findAllincludeParticipant() {
        try {
            const data = await this.chatRoomsService.findAllincludeParticipant();
            return {
                success: true,
                data,
                message: 'ChatRoom Fetched Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific chat room by ID' })
    @ApiResponse({
        status: 200,
        description: 'Chat room fetched successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'Chat room not found.',
    })
    async findOne(@Param('id') id: string) {
        try {
            const data = await this.chatRoomsService.findOne(+id);
            return {
                success: true,
                data,
                message: 'ChatRoom Fetched Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a chat room by ID' })
    @ApiResponse({
        status: 200,
        description: 'Chat room updated successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'Chat room not found.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data.',
    })
    async update(@Param('id') id: string, @Body() updateChatRoomDto: UpdateChatRoomDto) {
        try {
            await this.chatRoomsService.update(+id, updateChatRoomDto);
            return {
                success: true,
                message: 'ChatRoom Updated Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a chat room by ID' })
    @ApiResponse({
        status: 200,
        description: 'Chat room deleted successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'Chat room not found.',
    })
    async remove(@Param('id') id: string) {
        try {
            await this.chatRoomsService.remove(+id);
            return {
                success: true,
                message: 'ChatRoom Deleted Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
}
