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
import { AuthGuard } from './endpoints/auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
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
import { CertificateController } from './endpoints/certificate/certificate.controller';
import { CertificateService } from './endpoints/certificate/certificate.service';
import { ConsumerService } from './endpoints/consumer/consumer.service';
import { ConsumerController } from './endpoints/consumer/consumer.controller';
import { ContractController } from './endpoints/contract/contract.controller';
import { BindingController } from './endpoints/binding/binding.controller';
import { ContractService } from './endpoints/contract/contract.service';
import { BindingService } from './endpoints/binding/binding.service';
import { PurchasedPdtCacheController } from './endpoints/purchased-pdt-cache/purchased-pdt-cache.controller';
import { PurchasedPdtCacheService } from './endpoints/purchased-pdt-cache/purchased-pdt-cache.service';
import { CompanyController } from './endpoints/company/company.controller';
import { CompanyService } from './endpoints/company/company.service';
import { RouteHandoffService } from './endpoints/auth/route-handoff.service';
@Module({
  imports: [],
  controllers: [
    AppController,
    TemplatesController,
    AuthController,
    AssetController,
    FileController,
    CertificateController,
    ConsumerController,
    ContractController,
    BindingController,
    PurchasedPdtCacheController,
    CompanyController
  ],
  providers: [
    // Authentication is deny-by-default: every route is guarded unless it
    // carries @Public(), so a new handler is protected whether or not its
    // author thought about it. The guard also refuses a caller from another
    // company - this installation belongs to one.
    { provide: APP_GUARD, useClass: AuthGuard },
    AppService,
    TemplatesService,
    AuthService,
    RouteHandoffService,
    AssetService,
    FileService,
    CertificateService,
    ConsumerService,
    ContractService,
    BindingService,
    PurchasedPdtCacheService,
    CompanyService
  ],
})
export class AppModule {}
