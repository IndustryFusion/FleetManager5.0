import { Test, TestingModule } from '@nestjs/testing';
import { PurchasedPdtCacheController } from './purchased-pdt-cache.controller';
import { PurchasedPdtCacheService } from './purchased-pdt-cache.service';

describe('PurchasedPdtCacheController', () => {
  let controller: PurchasedPdtCacheController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasedPdtCacheController],
      providers: [PurchasedPdtCacheService],
    }).compile();

    controller = module.get<PurchasedPdtCacheController>(PurchasedPdtCacheController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
