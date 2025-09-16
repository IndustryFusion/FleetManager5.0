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

  @Get('get-contract-details-by-binding-company/:binding_company_ifric_id/:contract_company_ifric_id/:asset_ifric_id')
  getContractDetailsByBindingCompany(@Param('binding_company_ifric_id') binding_company_ifric_id: string, @Param('contract_company_ifric_id') contract_company_ifric_id: string, @Param('asset_ifric_id') asset_ifric_id: string) {
    return this.bindingService.getContractDetailsByBindingCompany(binding_company_ifric_id, contract_company_ifric_id, asset_ifric_id);
  }
}
