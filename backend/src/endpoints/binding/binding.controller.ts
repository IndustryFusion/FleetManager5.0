import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BindingService } from './binding.service';
import { CreateBindingDto, UpdateBindingDto } from './dto/binding.dto';

@Controller('binding')
export class BindingController {
  constructor(private readonly bindingService: BindingService) {}

  @Post()
  create(@Body() createBindingDto: CreateBindingDto) {
    return this.bindingService.create(createBindingDto);
  }
}
