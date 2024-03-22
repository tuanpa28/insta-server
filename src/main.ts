import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import helmet from 'helmet';
import * as passport from 'passport';

import { ACCESS_TOKEN_NAME } from '@/libs/common/constants';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.API_PORT || 8080;
  const logger = new Logger('api-gateway');

  const app: NestExpressApplication = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
    credentials: true,
  });
  app.use(helmet());
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SECRET_KEY_SESSION,
      resave: false,
      saveUninitialized: true,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Use swagger to generate documentations
  const swaggerDocument = new DocumentBuilder()
    .setTitle('Insta App RESTful API Documentations')
    .setContact(
      'Insta Teams',
      'https://insta--app.vercel.app',
      'phamanhtuan2833@gmail.com',
    )
    .setVersion('1.0')
    .setDescription('This is the documentation for the Insta App RESTful API.')
    .addServer('https://insta--server.vercel.app')
    .addServer('http://localhost:8080')
    .addBearerAuth(
      {
        description: `[just text field] Please enter your access token`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      ACCESS_TOKEN_NAME, // This name here is important for matching up with @ApiBearerAuth() in controller!
    )
    .build();

  const swaggerDocumentOptions: SwaggerDocumentOptions = {
    // re-define the url for each method in controller
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const document = SwaggerModule.createDocument(
    app,
    swaggerDocument,
    swaggerDocumentOptions,
  );
  const swaggerCustomOptions: SwaggerCustomOptions = {
    customSiteTitle: 'InstaApp Restful API Documentation',
  };

  SwaggerModule.setup('swagger', app, document, swaggerCustomOptions);

  await app.listen(port, () => {
    logger.log(
      `⚡️ [http] ready on port: ${port}, url: http://localhost:${port}`,
    );
  });
}
bootstrap();
