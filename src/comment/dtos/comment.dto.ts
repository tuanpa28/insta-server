import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import ReplyCommentDto from './reply-comment.dto';

class CommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  post_id: string;

  @ApiProperty()
  @IsString({ message: 'Content should be a string' })
  @IsNotEmpty({ message: 'Content should not be empty' })
  @MaxLength(400)
  content: string;

  @ApiProperty()
  @IsArray()
  likes: Array<string>;

  @ApiProperty()
  @IsArray()
  replies: ReplyCommentDto[];
}

export default CommentDto;
