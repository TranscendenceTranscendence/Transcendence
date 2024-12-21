import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Patch,
    Param,
    ParseIntPipe,
    Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateChatParticipantDto } from './dto/create-chat_participant.dto';
import { UpdateChatParticipantDto } from './dto/update-chat_participant.dto';
import { ChatParticipantsService } from './chat_participants.service';

@ApiTags('ChatParticipants')
@Controller('chatParticipants')
export class ChatParticipantsController {
    constructor(private readonly chatParticipantsService: ChatParticipantsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a chat participant' })
    @ApiResponse({ status: 201, description: 'ChatParticipant created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid data provided.' })
    async create(@Body() createChatParticipantDto: CreateChatParticipantDto) {
        try {
            await this.chatParticipantsService.create(createChatParticipantDto);
            return {
                success: true,
                message: 'ChatParticipant Created Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Post(':chatRoomId/join/:userId')
    @ApiOperation({ summary: 'Add a participant to a chat room' })
    @ApiResponse({ status: 200, description: 'Participant added successfully to chat room.' })
    @ApiResponse({ status: 400, description: 'Invalid chatRoomId or userId.' })
    async addParticipantToChatroom(
        @Param('chatRoomId') chatRoomId: number,
        @Param('userId') userId: number,
        @Body() body: { user_id: number; chat_room_id: number },
    ) {
        return this.chatParticipantsService.addParticipantToChatRoom(chatRoomId, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Fetch all chat participants' })
    @ApiResponse({ status: 200, description: 'ChatParticipants fetched successfully.' })
    async findAll() {
        try {
            const data = await this.chatParticipantsService.findAll();
            return {
                success: true,
                data,
                message: 'ChatParticipant Fetched Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Fetch a chat participant by ID' })
    @ApiResponse({ status: 200, description: 'ChatParticipant fetched successfully.' })
    @ApiResponse({ status: 404, description: 'ChatParticipant not found.' })
    async findOne(@Param('id') id: string) {
        try {
            const data = await this.chatParticipantsService.findByChatRoomId(+id);
            return {
                success: true,
                data,
                message: 'ChatParticipant Fetched Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Get(':chatRoomId/find/:userId')
    @ApiOperation({ summary: 'Fetch participant in chat room by user ID' })
    @ApiResponse({ status: 200, description: 'Participant fetched successfully.' })
    @ApiResponse({ status: 404, description: 'Participant not found in chat room.' })
    async findParticipantChatRoomUserId(
        @Param('chatRoomId') chatRoomId: number,
        @Param('userId') userId: number,
        @Body() body: { user_id: number; chat_room_id: number },
    ) {
        try {
            const data = await this.chatParticipantsService.findByUserIdAndChatRoom(+chatRoomId, +userId);
            return {
                success: true,
                data,
                message: 'ChatParticipant Fetched Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Get(':chatRoomId/find')
    @ApiOperation({ summary: 'Fetch participants by chat room ID' })
    @ApiResponse({ status: 200, description: 'Participants fetched successfully.' })
    @ApiResponse({ status: 404, description: 'Chat room not found.' })
    async findParticipantByChatRoom(
        @Param('chatRoomId') chatRoomId: number,
        @Body() body: { user_id: number; chat_room_id: number },
    ) {
        try {
            const data = await this.chatParticipantsService.findByChatRoomId(+chatRoomId);
            return {
                success: true,
                data,
                message: 'ChatParticipant Fetched Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Put(':chatRoomId/update/:id')
    @ApiOperation({ summary: 'Update a chat participant' })
    @ApiResponse({ status: 200, description: 'ChatParticipant updated successfully.' })
    @ApiResponse({ status: 404, description: 'ChatParticipant not found.' })
    async updateParticipant(
        @Param('chatRoomId') chatRoomId: number,
        @Param('id') id: number,
        @Body() updateDto: UpdateChatParticipantDto,
    ) {
        return await this.chatParticipantsService.update(chatRoomId, id, updateDto);
    }

    @Delete(':chatRoomId/delete/:id')
    @ApiOperation({ summary: 'Remove a chat participant' })
    @ApiResponse({ status: 200, description: 'ChatParticipant removed successfully.' })
    @ApiResponse({ status: 404, description: 'ChatParticipant not found.' })
    async remove(
        @Param('id') userId: string,
        @Param('chatRoomId') chatRoomId: string,
    ) {
        try {
            await this.chatParticipantsService.remove(+chatRoomId, +userId);
            return {
                success: true,
                message: 'ChatParticipant Deleted Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
}
