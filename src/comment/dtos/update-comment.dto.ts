import { PartialType } from '@nestjs/mapped-types';
import CreateCommentDto from './create-comment.dto';
import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import ReplyCommentDto from './reply-comment.dto';

export default class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiProperty()
  @IsArray()
  likes: string[];

  @ApiProperty()
  @IsArray()
  replies: ReplyCommentDto[];
}
