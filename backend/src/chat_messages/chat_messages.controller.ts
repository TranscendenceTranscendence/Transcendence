// Chat Messages Controller
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateChatMessageDto } from './dto/create-chat_message.dto';
import { ChatMessagesService } from './chat_messages.service';
import { findChatMessageDto } from './dto/find.dto';
import {
  AuthenticatedRequest,
  JwtAccessAuthGuard,
} from '../auth/guards/jwt-access.guard';
import { MessagesResponse } from './dto/chat_message-response.dto';

@ApiTags('ChatMessages') // Groups the endpoints under "ChatMessages" in Swagger
@Controller('chatMessages')
export class ChatMessagesController {
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a chat message' })
  @ApiResponse({
    status: 201,
    description: 'Chat message created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.',
  })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createChatMessageDto: CreateChatMessageDto,
  ) {
    try {
      const { chat_room_id: chatRoomId, content } = createChatMessageDto;
      if (!chatRoomId || !content) {
        throw new HttpException(
          'Chat room ID and message are required.',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (content.length > 500) {
        throw new HttpException(
          'Message length exceeds 500 characters.',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (content.length < 1) {
        throw new HttpException(
          'Message length must be at least 1 character.',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.chatMessagesService.create(createChatMessageDto, req.user.id);
      return {
        success: true,
        message: 'ChatMessage Created Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('find')
  @ApiOperation({ summary: 'Find chat messages' })
  @ApiResponse({
    status: 200,
    description: 'Chat messages fetched successfully.',
    type: MessagesResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async find(
    @Req() req: AuthenticatedRequest,
    @Query() findChatMessageDto: findChatMessageDto,
  ): Promise<MessagesResponse> {
    try {
      const data = await this.chatMessagesService.find({
        ...findChatMessageDto,
        currentUserId: req.user.id,
      });
      return {
        success: true,
        data,
        message: 'Chat messages fetched successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all chat messages' })
  @ApiResponse({
    status: 200,
    description: 'Chat messages fetched successfully.',
    type: MessagesResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async findAll(): Promise<MessagesResponse> {
    try {
      const data = await this.chatMessagesService.findAllAndSortByTime();
      return {
        success: true,
        data,
        message: 'ChatMessage Fetched Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve chat messages by chat room ID' })
  @ApiResponse({
    status: 200,
    description: 'Chat messages fetched successfully.',
    type: MessagesResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Chat room not found.',
  })
  async findOne(@Param('id') id: string): Promise<MessagesResponse> {
    try {
      const data = await this.chatMessagesService.findByChatRoomId(+id);
      return {
        success: true,
        data,
        message: 'ChatMessage Fetched Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Delete(':chatRoomId')
  @ApiOperation({ summary: 'Delete all chat messages for a chat room' })
  @ApiResponse({
    status: 200,
    description: 'Chat messages deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Chat room not found.',
  })
  async remove(@Param('chatRoomId') chatRoomId: string) {
    try {
      await this.chatMessagesService.remove(+chatRoomId);
      return {
        success: true,
        message: 'ChatMessage Deleted Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Retrieve all messages by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Messages fetched successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async findAllByUserId(@Param('userId') userId: string) {
    try {
      const messages = await this.chatMessagesService.findByUserId(+userId);
      return {
        success: true,
        data: messages,
        message: 'Messages fetched successfully.',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('chatRoom/:chatRoomId/user/:userId')
  @ApiOperation({ summary: 'Retrieve messages by user ID and chat room ID' })
  @ApiResponse({
    status: 200,
    description: 'Messages fetched successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Chat room or user not found.',
  })
  async findAllByUserAndChatRoom(
    @Param('chatRoomId') chatRoomId: string,
    @Param('userId') userId: string,
  ) {
    try {
      const messages = await this.chatMessagesService.findByUserIdAndChatRoomId(
        +userId,
        +chatRoomId,
      );
      return {
        success: true,
        data: messages,
        message: 'Messages fetched successfully.',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
