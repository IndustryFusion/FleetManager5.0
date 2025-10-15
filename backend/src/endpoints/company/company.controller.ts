import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Request } from 'express';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('get-assets-and-owner-details/:company_ifric_id')
  getAssetsAndOwnerDetails(@Param('company_ifric_id') company_ifric_id: string, @Req() req: Request) {
    return this.companyService.getAssetsAndOwnerDetails(company_ifric_id, req);
  }

}
