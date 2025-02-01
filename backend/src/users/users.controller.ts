import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    ParseIntPipe,
    Delete,
    HttpException,
    NotFoundException,
    InternalServerErrorException,
    Req,
    UseInterceptors,
    UploadedFile,
    UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import {User} from "./user.entity";
import { AuthGuard } from '@nestjs/passport';
import { JwtAccessAuthGuard } from "../auth/guards/jwt-access.guard";
import { PartialType } from '@nestjs/mapped-types';
import RequestWithUser from '../auth/interfaces/requestWithUser.interface';
import { JwtAuthGuard } from '../common/gaurds/jwt-auth.gaurd';


class MeResponseSuccess extends PartialType(User) {
    @ApiProperty()
    id: number;
    @ApiProperty({ type: 'string', description: 'The url to avatar' })
    avatar: string;
    @ApiProperty({ type: 'string', description: 'The nickname of the user.' })
    nickname: string;
    @ApiProperty({ type: 'boolean', description: 'The two factor authentication status of the user.' })
    enable_two_factor: boolean;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid data provided.' })
    async create(@Body() createUserDto: CreateUserDto) {
        try {
            await this.usersService.create(createUserDto);
            return {
                success: true,
                message: 'User Created Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Users fetched successfully.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    @UseGuards(AuthGuard('jwt'))
    async findAll() {
        try {
            const data = await this.usersService.findAll();
            return {
                success: true,
                data,
                message: 'Users Fetched Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }


    @Get('me')
    @ApiOperation({ summary: 'Get current user details' })
    @ApiResponse({ status: 200, description: 'User fetched successfully.', type: User })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @UseGuards(JwtAccessAuthGuard)
    async me(@Req() req: RequestWithUser): Promise<User> {
        console.log("inside /users/me, req.user.id", req.user.id);
        try {
            const user = req.user;

            // user to me response
            return {
                id: user.id,
                avatar: user.avatar,
                nickname: user.nickname,
                email: user.email,
                user_status: user.user_status,
                two_factor_enabled: user.two_factor_enabled,
                two_factor_auth_secret: user.two_factor_auth_secret,
                ladder_level: user.ladder_level,
                is_second_auth_done: user.is_second_auth_done,
                achievements: user.achievements,
                blockedUsers: user.blockedUsers,
                users: user.users,
                chatMessages: user.chatMessages,
                chatParticipants: user.chatParticipants,
                sentFriendRequests: user.sentFriendRequests,
                receivedFriendRequests: user.receivedFriendRequests,
                players1: user.players1,
                players2: user.players2,
                winners: user.winners,
            };
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiResponse({ status: 200, description: 'User fetched successfully.', type: User })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async findOne(@Param('id') id: number): Promise<User> {
        console.log("tesseeetteteteteteeeesttt")
        try {
            const data = await this.usersService.findOne(+id);
            if (data === undefined) {
                throw new NotFoundException('User not found');
            }
            return {
                ...data,
                avatar: data.avatar,
            };
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }


    @Patch('me')
    @ApiOperation({ summary: 'Update current user details' })
    @ApiResponse({ status: 200, description: 'User updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid data provided.' })
    @ApiResponse({ status: 401, description: 'Unauthorized access.' })
    @UseGuards(JwtAccessAuthGuard)
    async update(@Body() body: UpdateUserDto, @Req() req: RequestWithUser) {
        try {
            await this.usersService.update(req.user.id, body);
            return {
                message: 'User Updated Successfully',
            };
        } catch (error) {
            return error;
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user by ID' })
    @ApiResponse({ status: 200, description: 'User deleted successfully.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async remove(@Param('id') id: string) {
        try {
            await this.usersService.remove(+id);
            return {
                success: true,
                message: 'User Deleted Successfully',
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
}
