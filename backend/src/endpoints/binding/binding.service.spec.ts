import { Test, TestingModule } from '@nestjs/testing';
import { BindingService } from './binding.service';

describe('BindingService', () => {
  let service: BindingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BindingService],
    }).compile();

    service = module.get<BindingService>(BindingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
