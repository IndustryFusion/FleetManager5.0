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
