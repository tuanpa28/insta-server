import { CloudinaryResponse } from '@/libs/third-party/cloudinary';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadedResponseDTO {
  constructor({ secure_url, resource_type }: CloudinaryResponse) {
    this.url = secure_url;
    this.type = resource_type;
  }

  // @ApiProperty({
  //   description: 'Media public id',
  // })
  // @IsString()
  // @IsNotEmpty()
  // publicId: string;

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
