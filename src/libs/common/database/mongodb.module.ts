import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

const logger = new Logger('MongoDB');

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') || process.env.MONGODB_URI,
        retryDelay: 1000,
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            logger.log(
              `⚡️ [Mongodb] is connected: ${connection?.host}/${connection?.name}`,
            );
          });
          connection._events.connected();
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MongodbModule {}
