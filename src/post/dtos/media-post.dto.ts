import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

class MediaDto {
  @ApiProperty({
    type: String,
    enum: ['image', 'video'],
    description: 'Type of media (image or video)',
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(['image', 'video'])
  type: string;

  @ApiProperty({
    type: String,
    description: 'URL of the media',
  })
  @IsNotEmpty()
  @IsString()
  url: string;
}

export default MediaDto;
