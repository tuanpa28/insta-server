import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import MediaDto from './media-post.dto';
import SharePostDto from './share-post.dto';

class PostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  caption: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  media: MediaDto[];

  @ApiProperty()
  @IsArray()
  likes: Array<string>;

  @ApiProperty()
  @IsArray()
  shares: Array<SharePostDto>;

  @ApiProperty()
  @IsString()
  slug: string;
}

export default PostDto;
