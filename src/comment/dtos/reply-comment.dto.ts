import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

class ReplyCommentDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @IsString({ message: 'Content should be a string' })
  @IsNotEmpty({ message: 'Content should not be empty' })
  @MaxLength(400)
  content: string;
}

export default ReplyCommentDto;
