import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ReplyCommentDto } from '../dtos';

export type CommentDocument = Comment & mongoose.Document;

@Schema({ versionKey: false, timestamps: true })
export class Comment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user_id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true })
  post_id: mongoose.Schema.Types.ObjectId;

  @Prop({ max: 400, required: true })
  content: string;

  @Prop({ default: [] })
  likes: mongoose.Schema.Types.ObjectId[];

  @Prop({ default: [] })
  replies: ReplyCommentDto[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
