import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import * as streamifier from 'streamifier';

import { CloudinaryResponse } from './cloudinary-response';
import {
  CLOUDINARY_ALLOW_IMAGE_FORMATS,
  CLOUDINARY_ROOT_FOLDER_NAME,
} from './cloudinary.constant';
import { buildPublicId } from './cloudinary.util';
import { optimizeCloudinaryUrl } from '@/utils';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    const options: UploadApiOptions = {
      folder: CLOUDINARY_ROOT_FOLDER_NAME,
      allowed_formats: CLOUDINARY_ALLOW_IMAGE_FORMATS,
      resource_type: 'auto',
      public_id: buildPublicId(file),
      transformation: {
        format: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
        dpr: 'auto',
      },
    };

    const uploadPromise = (file: Express.Multer.File) =>
      new Promise<CloudinaryResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        const fileBuffer = Buffer.isBuffer(file.buffer)
          ? file.buffer
          : Buffer.from(file.buffer);

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
      });

    const response = await uploadPromise(file);

    return {
      ...response,
      url: optimizeCloudinaryUrl(response.url),
      secure_url: optimizeCloudinaryUrl(response.secure_url),
    };
  }

  deleteFile(publicId: string): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  async getFileByPublicId(publicId: string): Promise<CloudinaryResponse> {
    const getFileById = (publicId: string) =>
      new Promise<CloudinaryResponse>((resolve, reject) => {
        cloudinary.api.resource(publicId, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

    const response = await getFileById(publicId);
    return {
      ...response,
      url: optimizeCloudinaryUrl(response.url),
      secure_url: optimizeCloudinaryUrl(response.secure_url),
    };
  }
}
