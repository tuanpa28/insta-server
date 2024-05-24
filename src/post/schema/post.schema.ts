import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import * as randomstring from 'randomstring';
import slugify from 'slugify';
import { MediaDto } from '../dtos';

export type PostDocument = Post & mongoose.Document;

@Schema({ versionKey: false, timestamps: true })
export class Post {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user_id: mongoose.Schema.Types.ObjectId;

  @Prop({ max: 500 })
  caption: string;

  @Prop({ type: [MediaDto], required: true })
  media: MediaDto[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  likes: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        date: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  shares: Array<{
    user_id: mongoose.Schema.Types.ObjectId;
    date: Date;
  }>;

  @Prop({ unique: true })
  slug: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.pre('save', async function (next) {
  try {
    this['slug'] = slugify(this['caption'], { replacement: '_', lower: true });

    const model = this.constructor as any; // Accessing model inside middleware
    const slug = this['slug'];
    // Kiểm tra nếu slug đã tồn tại hoặc là rỗng, thêm chuỗi ngẫu nhiên vào slug
    const existingPost = await model.findOne({ slug });
    if (existingPost) {
      const randomString = randomstring.generate(8);
      this['slug'] = `${slug}_${randomString}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});
