import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  Body,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { InviteService } from './invite.service';
import { Invite } from './invite.entity';
import {
  JwtAccessAuthGuard,
  AuthenticatedRequest,
} from '../auth/guards/jwt-access.guard';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

class CreateInviteDto {
  @ApiProperty({ description: 'ID of the user to invite', type: Number })
  receiverUserId: number;
}

class AcceptInviteResponse {
  @ApiProperty({
    description: 'Whether the operation was successful',
    type: Boolean,
  })
  success: boolean;

  @ApiProperty({
    description: 'ID of the game room',
    type: String,
    required: false,
  })
  gameRoomId?: string;

  @ApiProperty({ description: 'Response message', type: String })
  message: string;
}

class InviteResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    type: Boolean,
  })
  success: boolean;

  @ApiProperty({ description: 'Response message', type: String })
  message: string;
}

@ApiTags('Invite')
@Controller('invite')
export class InviteController {
  constructor(
    private readonly inviteService: InviteService,
    private readonly usersService: UsersService,
  ) {}

  @Post('send')
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a game invite to another user' })
  @ApiResponse({
    status: 201,
    description: 'Invite sent successfully',
    type: InviteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createInvite(
    @Body() createInviteDto: CreateInviteDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<InviteResponseDto> {
    try {
      const senderUserId = req.user.id;

      await this.inviteService.createInvite(
        senderUserId,
        createInviteDto.receiverUserId,
      );

      return {
        success: true,
        message: 'Game invitation sent successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send invitation',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('pending')
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pending invites for a user' })
  @ApiResponse({
    status: 200,
    description: 'Pending invites retrieved successfully',
    type: [Invite],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPendingInvites(@Req() req: AuthenticatedRequest): Promise<Invite[]> {
    if (!req.user) {
      throw new HttpException(
        'You can only view your own invites',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return await this.inviteService.getPendingInvites(req.user.id);
  }

  @Get('sent')
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all sent invites for a user' })
  @ApiResponse({
    status: 200,
    description: 'Sent invites retrieved successfully',
    type: [Invite],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSentInvites(@Req() req: AuthenticatedRequest): Promise<Invite[]> {
    if (!req.user) {
      throw new HttpException(
        'You can only view your own sent invites',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return await this.inviteService.getSentInvites(req.user.id);
  }

  @Post('accept/:inviteId')
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept a game invite' })
  @ApiResponse({
    status: 200,
    description: 'Invite accepted successfully',
    type: AcceptInviteResponse,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Invite not found' })
  async acceptInvite(
    @Param('inviteId', ParseIntPipe) inviteId: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<AcceptInviteResponse> {
    try {
      const userId = req.user.id;
      const result = await this.inviteService.acceptInvite(inviteId, userId);

      return {
        success: true,
        gameRoomId: result.gameRoomId,
        message: 'Game invitation accepted',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to accept invitation',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('decline/:inviteId')
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Decline a game invite' })
  @ApiResponse({
    status: 200,
    description: 'Invite declined successfully',
    type: InviteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Invite not found' })
  async declineInvite(
    @Param('inviteId', ParseIntPipe) inviteId: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<InviteResponseDto> {
    try {
      const userId = req.user.id;
      await this.inviteService.declineInvite(inviteId, userId);

      return {
        success: true,
        message: 'Game invitation declined',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to decline invitation',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('online')
  @ApiOperation({ summary: 'Get all online users' })
  @ApiResponse({
    status: 200,
    description: 'Online users fetched successfully.',
    type: [User],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  async findAllOnlineUsers(@Req() req: AuthenticatedRequest): Promise<User[]> {
    if (!req.user) {
      throw new UnauthorizedException('No authenticated user found');
    }

    try {
      if (isNaN(req.user.id)) {
        return [];
      }
      return await this.inviteService.findAllOnlineUsers(req.user.id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch online users');
    }
  }
}
