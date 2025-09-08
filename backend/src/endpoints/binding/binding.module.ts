import { Module } from '@nestjs/common';
import { BindingService } from './binding.service';
import { BindingController } from './binding.controller';

@Module({
  controllers: [BindingController],
  providers: [BindingService],
})
export class BindingModule {}
