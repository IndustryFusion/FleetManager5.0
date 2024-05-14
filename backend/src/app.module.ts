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

@Module({
  imports: [],
  controllers: [
    AppController,
    TemplatesController,
    AuthController,
    AssetController,
    FileController
  ],
  providers: [
    AppService,
    TemplatesService,
    AuthService,
    AssetService,
    FileService
  ],
})
export class AppModule {}
