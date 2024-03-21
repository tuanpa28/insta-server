import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = User & mongoose.Document;

@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop()
  googleId: string;

  @Prop({ min: 4, max: 50, required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ min: 6, required: true })
  password: string;

  @Prop({ min: 4, max: 50, required: true })
  full_name: string;

  @Prop({ default: '' })
  profile_image: string;

  @Prop({ max: 500, default: '' })
  bio: string;

  @Prop({ default: null })
  date_of_birth: Date;

  @Prop({ default: '' })
  gender: string;

  @Prop({ max: 100, default: '' })
  current_city: string;

  @Prop({ max: 100, default: '' })
  from: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  followers: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  followings: mongoose.Schema.Types.ObjectId[];

  @Prop({ default: false })
  tick: boolean;

  @Prop({ default: false })
  isAdmin: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ username: 'text', full_name: 'text' });
