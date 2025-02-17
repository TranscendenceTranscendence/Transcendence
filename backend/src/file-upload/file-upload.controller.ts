import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import {
  ApiConsumes,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
  @ApiProperty({ required: false })
  filename?: string;
  @ApiProperty({ required: false })
  category?: string;
}

class FileUploadResponseSuccess {
  @ApiProperty()
  message: string;
  @ApiProperty()
  filePath: string;
}

@Controller('file-upload')
@ApiTags('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: FileUploadResponseSuccess,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: FileUploadDto,
  ) {
    console.log(body);
    return this.fileUploadService.handleFileUpload(file);
  }
}
