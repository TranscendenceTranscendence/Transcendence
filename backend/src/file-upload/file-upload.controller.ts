import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile, Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: { file: File }) {
    return this.fileUploadService.handleFileUpload(file);
  }
}