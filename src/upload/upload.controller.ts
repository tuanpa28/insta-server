import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '@/auth/guards';
import { ACCESS_TOKEN_NAME } from '@/libs/common/constants';
import { UploadService } from './upload.service';

@Controller('upload')
@ApiTags('Upload File')
@UseGuards(AuthGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('images')
  @ApiOperation({ summary: 'Upload Images' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  @UseInterceptors(FilesInterceptor('image', 6))
  async uploadImages(@UploadedFiles() files: Array<Express.Multer.File>) {
    try {
      const results = await this.uploadService.uploadArrayImage(files);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('video')
  @ApiOperation({ summary: 'Upload Video (file smaller than 4.5MB)' })
  @ApiBearerAuth(ACCESS_TOKEN_NAME)
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    try {
      const result = await this.uploadService.uploadSingleFile(file);

      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data: [result],
      };
    } catch (error) {
      throw new HttpException(
        {
          isError: true,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
