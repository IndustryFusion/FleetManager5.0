// 
// Copyright (c) 2024 IB Systems GmbH 
// 
// Licensed under the Apache License, Version 2.0 (the "License"); 
// you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at 
// 
//   http://www.apache.org/licenses/LICENSE-2.0 
// 
// Unless required by applicable law or agreed to in writing, software 
// distributed under the License is distributed on an "AS IS" BASIS, 
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
// See the License for the specific language governing permissions and 
// limitations under the License. 
// 

import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Split CORS_ORIGIN values by comma to handle multiple origins
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];

  // Using NestJS built-in CORS support with multiple origins from CORS_ORIGIN env
  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  }));

  app.use(cookieParser());
  await app.listen(4001);
}
bootstrap();
