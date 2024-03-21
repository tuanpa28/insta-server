import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import MediaDto from './media-post.dto';

class CreatePostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  caption: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  media: MediaDto[];
}

export default CreatePostDto;
