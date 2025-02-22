import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { GetAchievementsByUserIdRequestDto } from './dto/get-achievements-by-user-id-request.dto';
import { AchievementsResponse } from './dto/achievements-response.dto';

@ApiTags('Achievements') // Grouping for Swagger
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all achievements for a user' })
  @ApiResponse({
    status: 200,
    description: 'Achievements fetched successfully',
    type: AchievementsResponse,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findAllbyUserId(
    @Query() query: GetAchievementsByUserIdRequestDto,
  ): Promise<AchievementsResponse> {
    try {
      const data = await this.achievementsService.findByUserId(query.userId);
      return {
        achievements: data,
      };
    } catch (error) {
      // Throwing an exception here will allow NestJS's exception filters to properly handle the response.
      throw new NotFoundException(error.message);
    }
  }
}
