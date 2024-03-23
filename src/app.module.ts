import { AuthModule } from '@/auth/auth.module';
import { CommentModule } from '@/comment/comment.module';
import { AppConfigModule } from '@/libs/common/appConfig';
import { MongodbModule } from '@/libs/common/database';
import { NotifiModule } from '@/notification/notification.module';
import { PostModule } from '@/post/post.module';
import { UploadModule } from '@/upload/upload.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    AppConfigModule,
    MongodbModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: '/swagger',
    }),
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
