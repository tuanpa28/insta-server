import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CloudinaryResponse } from '@/libs/third-party/cloudinary';

export class UploadedResponseDTO {
  constructor({ public_id, secure_url, fieldname }: CloudinaryResponse) {
    this.publicId = public_id;
    this.url = secure_url;
    this.type = fieldname;
  }

  @ApiProperty({
    description: 'Media public id',
  })
  @IsString()
  @IsNotEmpty()
  publicId: string;

  @ApiProperty({
    description: 'Media type',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Media url',
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}
