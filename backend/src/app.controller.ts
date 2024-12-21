import { Controller, Get } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

class HelloResponseDto {
  message: string;
}

class ApiResponseWrapper<T> {
  success: boolean;
  data: T;
}

@ApiTags('App')
@Controller()
@ApiExtraModels(HelloResponseDto)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({
    type: ApiResponseWrapper<HelloResponseDto>,
    description: 'Returns a hello message',
  })
  getHello(): ApiResponseWrapper<HelloResponseDto> {
    return {
      success: true,
      data: this.appService.getHello(),
    };
  }
}
