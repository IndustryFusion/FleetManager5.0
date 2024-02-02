import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true, 
  }));

  app.use(cookieParser());
  await app.listen(4000);
}
bootstrap();
