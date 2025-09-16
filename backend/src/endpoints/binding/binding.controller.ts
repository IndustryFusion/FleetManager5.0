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

  @Get('get-contract-details-by-binding-company/:company_ifric_id')
  getContractDetailsByBindingCompany(@Param('company_ifric_id') company_ifric_id: string) {
    return this.bindingService.getContractDetailsByBindingCompany(company_ifric_id);
  }
}
