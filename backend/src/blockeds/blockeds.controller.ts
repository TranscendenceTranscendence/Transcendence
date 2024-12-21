// Blockeds Controller
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateBlockedDto } from './dto/create-blocked.dto';
import { UpdateBlockedDto } from './dto/update-blocked.dto';
import { Blocked } from './blocked.entity';
import { BlockedsService } from './blockeds.service';

@ApiTags('Blockeds') // Groups the endpoints under "Blockeds" in Swagger
@Controller('blockeds')
export class BlockedsController {
  constructor(private readonly blockedsService: BlockedsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a blocked entry' })
  @ApiResponse({
    status: 201,
    description: 'Blocked entry created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.',
  })
  async create(@Body() createBlockedDto: CreateBlockedDto) {
    try {
      await this.blockedsService.create(createBlockedDto);
      return {
        success: true,
        message: 'Blocked Created Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all blocked entries' })
  @ApiResponse({
    status: 200,
    description: 'Blocked entries fetched successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async findAll() {
    try {
      const data = await this.blockedsService.findAll();
      return {
        success: true,
        data,
        message: 'Blocked Fetched Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a blocked entry by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Blocked entry fetched successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Blocked entry not found.',
  })
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.blockedsService.findByUserId(+id);
      return {
        success: true,
        data,
        message: 'Blocked Fetched Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blocked entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Blocked entry deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Blocked entry not found.',
  })
  async remove(@Param('id') id: string) {
    try {
      await this.blockedsService.remove(+id);
      return {
        success: true,
        message: 'Blocked Deleted Successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
