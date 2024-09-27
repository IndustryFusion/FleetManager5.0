import { Test, TestingModule } from '@nestjs/testing';
import { SharedDataController } from './shared-data.controller';

describe('SharedDataController', () => {
  let controller: SharedDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SharedDataController],
    }).compile();

    controller = module.get<SharedDataController>(SharedDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
