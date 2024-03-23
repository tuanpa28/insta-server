import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { CloudinaryModule } from '@/libs/third-party/cloudinary';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [CloudinaryModule, MulterModule.register({})],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
