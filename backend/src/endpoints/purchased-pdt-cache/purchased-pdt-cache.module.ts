import { Module } from '@nestjs/common';
import { PurchasedPdtCacheService } from './purchased-pdt-cache.service';
import { PurchasedPdtCacheController } from './purchased-pdt-cache.controller';

@Module({
  controllers: [PurchasedPdtCacheController],
  providers: [PurchasedPdtCacheService],
})
export class PurchasedPdtCacheModule {}
