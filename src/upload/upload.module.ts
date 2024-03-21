import { HttpException, HttpStatus, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { CloudinaryModule } from '@/libs/third-party/cloudinary';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

export const multerOptions = {
  // limits: {
  //   fileSize: 1024 * 1024 * 10,
  // },
  dest: 'uploads',

  // Check the mimetypes to allow for upload
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|pdf|webp|mp4)$/)) {
      // Allow storage of file
      cb(null, true);
    } else {
      // Reject file
      cb(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },

  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'multer_tmp');
    },

    // File modification details
    filename: (req: any, file: any, cb: any) => {
      cb(null, `${uuid()}-${extname(file.originalname)}`);
    },
  }),
};

@Module({
  imports: [CloudinaryModule, MulterModule.register(multerOptions)],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
