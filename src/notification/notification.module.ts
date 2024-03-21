import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotifiController } from './notification.controller';
import { NotifiService } from './notification.service';
import { NotifiSchema, Notification } from './schema/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotifiSchema },
    ]),
  ],
  controllers: [NotifiController],
  providers: [NotifiService],
})
export class NotifiModule {}
