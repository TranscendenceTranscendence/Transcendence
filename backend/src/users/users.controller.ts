import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  InternalServerErrorException,
  Req,
  UseGuards,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import type { CreateUserDto } from './dto/create-user.dto';
import { type UpdateUserDto, UpdateUserResponse } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';
import {
  type AuthenticatedRequest,
  JwtAccessAuthGuard,
} from '../auth/guards/jwt-access.guard';
import { PartialType } from '@nestjs/mapped-types';
import type { UserDto } from './dto/user.dto';
import {
  type SearchUserRequestDto,
  SearchUserResponseDto,
} from './dto/search-user.dto';
import { In } from 'typeorm';

class MeResponseSuccess extends PartialType(User) {
  @ApiProperty()
  id: number;
  @ApiProperty({ type: 'string', description: 'The url to avatar' })
  avatar: string;
  @ApiProperty({ type: 'string', description: 'The nickname of the user.' })
  nickname: string;
  @ApiProperty({ type: 'string', description: 'The email of the user.' })
  email: string;
  @ApiProperty({
    type: 'boolean',
    description: 'The two factor authentication status of the user.',
  })
  two_factor_enabled: boolean;
  @ApiProperty({
    type: 'number',
    description: 'The ladder level of the user.',
  })
  ladder_level: number;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService,
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
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(JwtAccessAuthGuard)
  async me(@Req() req: AuthenticatedRequest): Promise<MeResponseSuccess> {
    try {
      const user = req.user;

      // user to me response
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id') id: number): Promise<UserDto> {
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
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    type: UpdateUserResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid data provided.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @UseGuards(JwtAccessAuthGuard)
  async update(
    @Body() body: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<UpdateUserResponse> {
    try {
      const nicknameTaken = !(await this.usersService.update(
        req.user.id,
        body,
      ));
      if (nicknameTaken) {
        return {
          success: false,
          errors: {
            nickname: 'Nickname already taken',
          },
        };
      }
      return {
        success: true,
        message: 'User Updated Successfully',
      };
    } catch (error) {
      return {
        success: false,
        errors: {
          global: error.message,
        },
      };
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

  @Post('search')
  @ApiOperation({ summary: 'Search for users by nickname or email' })
  @ApiResponse({
    status: 200,
    description: 'Users found successfully.',
    type: [SearchUserResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid search query.' })
  async search(
    @Body() body: SearchUserRequestDto,
  ): Promise<SearchUserResponseDto[]> {
    try {
      return await this.usersService.searchUsers(body.query);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
