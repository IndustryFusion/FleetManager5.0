import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Using NestJS built-in CORS support with corrected origin format
  app.enableCors({
    origin: ['http://85.215.129.117:3001', 'http://localhost:3001'],
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(4001);
}
bootstrap();
