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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import {User} from "./user.entity";
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../common/gaurds/jwt-auth.gaurd';

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

    @Get(':id')
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiResponse({ status: 200, description: 'User fetched successfully.', type: User })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async findOne(@Param('id') id: number): Promise<User> {
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
    @UseGuards(JwtAuthGuard)
    async update(@Body() body: UpdateUserDto, @Req() req: Request) {
        try {
            const userId = req.user.id;
            if (userId === undefined) {
                throw new HttpException('Unauthorized access', 401);
            }
            await this.usersService.update(userId, body);
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
