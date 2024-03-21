import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type NotificationDocument = Notification & mongoose.Document;

@Schema({ versionKey: false, timestamps: true })
export class Notification {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user_id: mongoose.Schema.Types.ObjectId;

  @Prop({ enum: ['like', 'comment', 'follow', 'share'], required: true })
  type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  source_id: mongoose.Schema.Types.ObjectId;

  @Prop({ default: false })
  seen: boolean;
}

export const NotifiSchema = SchemaFactory.createForClass(Notification);
