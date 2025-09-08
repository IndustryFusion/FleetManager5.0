import { Test, TestingModule } from '@nestjs/testing';
import { BindingController } from './binding.controller';
import { BindingService } from './binding.service';

describe('BindingController', () => {
  let controller: BindingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BindingController],
      providers: [BindingService],
    }).compile();

    controller = module.get<BindingController>(BindingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
