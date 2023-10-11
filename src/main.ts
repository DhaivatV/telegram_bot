import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as express from 'express';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // Define your CORS options here (modify as needed)
  const corsOptions: cors.CorsOptions = {
    origin: '*', // Set this to the origin you want to allow (e.g., http://localhost:3000)
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true, // Allow sending cookies and credentials
  };

  app.use(cors(corsOptions));

  await app.listen(3000);
}

bootstrap();
