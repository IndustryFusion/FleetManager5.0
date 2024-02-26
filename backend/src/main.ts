import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Using NestJS built-in CORS support with corrected origin format
  app.use(cors({
    origin: [process.env.CORS_ORIGIN],
    credentials: true,
  }));
  app.use(cookieParser());
  await app.listen(4001);
}
bootstrap();
