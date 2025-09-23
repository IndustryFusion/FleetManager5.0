import { Test, TestingModule } from '@nestjs/testing';
import { PurchasedPdtCacheService } from './purchased-pdt-cache.service';

describe('PurchasedPdtCacheService', () => {
  let service: PurchasedPdtCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PurchasedPdtCacheService],
    }).compile();

    service = module.get<PurchasedPdtCacheService>(PurchasedPdtCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
