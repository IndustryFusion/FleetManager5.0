import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ContractService } from './contract.service';

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get('get-company-contract/:company_ifric_id')
  findAll(@Param('company_ifric_id') company_ifric_id: string) {
    return this.contractService.findAll(company_ifric_id);
  }
}
