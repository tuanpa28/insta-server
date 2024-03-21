import { AuthModule } from '@/auth/auth.module';
import { CommentModule } from '@/comment/comment.module';
import { AppConfigModule } from '@/libs/common/appConfig';
import { MongodbModule } from '@/libs/common/database';
import { NotifiModule } from '@/notification/notification.module';
import { PostModule } from '@/post/post.module';
import { UploadModule } from '@/upload/upload.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    AppConfigModule,
    MongodbModule,
    UserModule,
    AuthModule,
    CommentModule,
    NotifiModule,
    PostModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
