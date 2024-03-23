import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { CloudinaryService } from '@/libs/third-party/cloudinary';
import { RpcException } from '@nestjs/microservices';
import { UploadedResponseDTO } from './dtos';

@Injectable()
export class UploadService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}
  private readonly logger = new Logger(UploadService.name);

  async getfileByPublicId(publicId: string) {
    try {
      const file = await this.cloudinaryService.getFileByPublicId(publicId);
      return { ...new UploadedResponseDTO(file) };
    } catch (error) {
      this.logger.error(error);
      if (error.http_code === 404) {
        throw new RpcException(
          new NotFoundException('errorMessage.PROPERTY_IS_NOT_FOUND'),
        );
      }
      throw new RpcException(
        new InternalServerErrorException('errorMessage.GET_FILE_FAILED'),
      );
    }
  }

  async uploadSingleFile(file: Express.Multer.File) {
    try {
      const uploadedfile = await this.cloudinaryService.uploadFile(file);
      return { ...new UploadedResponseDTO(uploadedfile) };
    } catch (error) {
      this.logger.error(error);
      throw new RpcException('errorMessage.UPLOAD_File_FAILED');
    }
  }

  async uploadArrayImage(images: Array<Express.Multer.File>) {
    const resolve = [];

    for (let i = 0; i < images.length; i++) {
      resolve.push(this.uploadSingleFile(images[i]));
    }

    return await Promise.all(resolve);
  }

  async deleteSinglefile(publicId: string) {
    try {
      const data = await this.cloudinaryService.deleteFile(publicId);
      return {
        isError: false,
        statusCode: HttpStatus.OK,
        message: 'Successful',
        data,
      };
    } catch (error) {
      this.logger.error(error);
      throw new RpcException('errorMessage.DELETE_FILE_FAILED');
    }
  }
}
