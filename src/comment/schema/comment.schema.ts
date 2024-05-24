import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

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

  @Prop({
    type: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: { type: String, required: true },
      },
    ],
    default: [],
  })
  replies: Array<{
    user_id: mongoose.Schema.Types.ObjectId;
    content: string;
  }>;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
