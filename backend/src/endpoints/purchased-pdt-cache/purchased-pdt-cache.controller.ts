import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { PurchasedPdtCacheService } from './purchased-pdt-cache.service';
import { CreatePurchasedPdtCacheDto, UpdatePurchasedPdtCacheDto } from './dto/purchased-pdt-cache.dto';
import { Request } from 'express';

@Controller('purchased-pdt-cache')
export class PurchasedPdtCacheController {
  constructor(private readonly factoryPdtCacheService: PurchasedPdtCacheService) {}

  @Post('/:company_ifric_id/:asset_ifric_id/:asset_cert_valid')
  create(@Param('company_ifric_id') company_ifric_id: string, @Param('asset_ifric_id') asset_ifric_id: string, @Param('asset_cert_valid') asset_cert_valid: string, @Req() req: Request) {
    return this.factoryPdtCacheService.create(company_ifric_id, asset_ifric_id, asset_cert_valid, req);
  }
}
