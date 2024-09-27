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

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TemplatesController } from './endpoints/templates/templates.controller';
import { AuthController } from './endpoints/auth/auth.controller';
import { AssetController } from './endpoints/asset/asset.controller';
import { FileController } from './endpoints/file/file.controller';
import { TemplatesService } from './endpoints/templates/templates.service';
import { AuthService } from './endpoints/auth/auth.service';
import { AssetService } from './endpoints/asset/asset.service';
import { FileService } from './endpoints/file/file.service';
import { SharedDataController } from './endpoints/shared-data/shared-data.controller';
import { SharedDataService } from './endpoints/shared-data/shared-data.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataAlertsEntity } from './endpoints/shared-data/dto/data-alerts.entity';
import { DataEventsEntity } from './endpoints/shared-data/dto/data-events.entity';
import { DataSeriesEntity } from './endpoints/shared-data/dto/data-series.entity';
import {  config }  from 'dotenv'; config()

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MQTT_SERVICE',
        transport: Transport.MQTT,
        options: {
          url: process.env.SHARED_MQTT_URL,
        },
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.ASSET_POSTGRES_URL,
      port: parseInt(process.env.ASSET_POSTGRES_PORT),
      username: process.env.ASSET_POSTGRES_USERNAME,
      password: process.env.ASSET_POSTGRES_PASSWORD,
      database: process.env.ASSET_POSTGRES_DATABASE,
      entities: [DataAlertsEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([DataAlertsEntity]),
  ],
  controllers: [
    AppController,
    TemplatesController,
    AuthController,
    AssetController,
    FileController,
    SharedDataController
  ],
  providers: [
    AppService,
    TemplatesService,
    AuthService,
    AssetService,
    FileService,
    SharedDataService
  ],
})
export class AppModule { }
