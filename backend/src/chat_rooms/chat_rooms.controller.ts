import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateChatRoomDto } from './dto/create-chat_room.dto';
import { UpdateChatRoomDto } from './dto/update-chat_room.dto';
import { ChatRoomsService } from './chat_rooms.service';
import {
  AuthenticatedRequest,
  JwtAccessAuthGuard,
} from '../auth/guards/jwt-access.guard';
import {
  ChatRoomResponse,
  ChatRoomsResponse,
} from './dto/chat_rooms-response.dto';
import { ChatRoom } from './chat_room.entity';
import { chat_participant_roles } from '../chat_participants/chat_participant.entity';

@ApiTags('ChatRooms')
@Controller('chatroom')
export class ChatRoomsController {
  constructor(private readonly chatRoomsService: ChatRoomsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new chat room and add the creator as an owner',
  })
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
      const chatRoom = await this.chatRoomsService.create(createChatRoomDto);
      return {
        success: true,
        message: 'ChatRoom Created Successfully',
        chatRoom,
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

  @Get('overview')
  @ApiOperation({ summary: 'Get all chat rooms the user can see' })
  @ApiResponse({
    status: 200,
    description: 'Chat rooms fetched successfully.',
  })
  @UseGuards(JwtAccessAuthGuard)
  async findOverview(@Req() req: AuthenticatedRequest) {
    try {
      const data = await this.chatRoomsService.findOverview(req.user.id);
      return {
        success: true,
        data,
        message: 'ChatRooms Fetched Successfully',
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
    type: ChatRoomsResponse,
  })
  async findAllincludeParticipant(): Promise<ChatRoomsResponse> {
    try {
      const data = await this.chatRoomsService.findAllincludeParticipant();
      return {
        success: true,
        chatRooms: data,
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
    type: ChatRoomResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Chat room not found.',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ChatRoomResponse> {
    try {
      const data = await this.chatRoomsService.findOne(id);
      return {
        success: true,
        chatRooms: [data],
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
  async update(
    @Param('id') id: number,
    @Body() updateChatRoomDto: UpdateChatRoomDto,
  ) {
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

  @Patch('editPassword/:id')
  @ApiOperation({ summary: 'Change password of chatRoom by id' })
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
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async editPassword(
    @Param('id') id: number,
    @Body() updateChatRoomDto: UpdateChatRoomDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user;
    const chatRoom: ChatRoom = await this.chatRoomsService.findOne(+id);
    const participant = chatRoom.chatParticipants.find((participant) => {
      console.log(
        `Comparing participant.user_id: ${participant.user_id} with user.id: ${user.id}`,
      );
      return participant.user_id === user.id;
    });
    if (!participant) {
      return {
        success: false,
        message: 'Participant not found in the chat room.',
      };
    }
    if (participant.chat_participant_role !== chat_participant_roles.Owner) {
      return {
        succes: false,
        message: 'Participant is not the owner',
      };
    }
    try {
      await this.chatRoomsService.editPassword(+id, updateChatRoomDto);
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
  async remove(@Param('id') id: number) {
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
