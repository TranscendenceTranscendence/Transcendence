import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete
} from '@nestjs/common';
import {ApiTags, ApiResponse, ApiOperation, ApiBody} from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';

@ApiTags('Achievements') // Grouping for Swagger
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an achievement' })
  @ApiResponse({
    status: 201,
    description: 'Achievement created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.',
  })
  @ApiBody({ type: CreateAchievementDto, required: true })
  async create(
    @Body() createAchievementDto: CreateAchievementDto,
  ) {
    try {
      await this.achievementsService.create(createAchievementDto);
      return {
        success: true,
        message: 'Achievement Created Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all achievements' })
  @ApiResponse({
    status: 200,
    description: 'Achievements fetched successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async findAll() {
    try {
      const data = await this.achievementsService.findAll();
      return {
        success: true,
        data,
        message: 'Achievement Fetched Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific achievement by ID' })
  @ApiResponse({
    status: 200,
    description: 'Achievement fetched successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Achievement not found.',
  })
  async findOne(@Param('id') id: number) {
    try {
      const data = await this.achievementsService.findOne(+id);
      return {
        success: true,
        data,
        message: 'Achievement Fetched Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific achievement by ID' })
  @ApiResponse({
    status: 200,
    description: 'Achievement updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.',
  })
  async update(
    @Param('id') id: number,
    @Body() updateAchievementDto: UpdateAchievementDto,
  ) {
    try {
      await this.achievementsService.update(+id, updateAchievementDto);
      return {
        success: true,
        message: 'Achievement Updated Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific achievement by ID' })
  @ApiResponse({
    status: 200,
    description: 'Achievement deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Achievement not found.',
  })
  async remove(@Param('id') id: number) {
    try {
      await this.achievementsService.remove(+id);
      return {
        success: true,
        message: 'Achievement Deleted Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
