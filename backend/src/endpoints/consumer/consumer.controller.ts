import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { Request } from 'express';
import { ConsumerService } from './consumer.service';

@Controller('consumer')
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}

  @Get('get-consumer-bindings/:consumerId')
  async getConsumerBindings(@Param('consumerId') consumerId: string, @Req() req: Request) {
    try {
      return await this.consumerService.getConsumerBindings(consumerId, req);
    } catch(err) {
      throw err;
    }
  }

  @Get('consume-data-from-dataroom/:producerId/:bindingId/:assetId')
  async consumeDataFromDataroom(@Param('producerId') producerId: string, @Param('bindingId') bindingId: string, @Param('assetId') assetId: string, @Query('fromTimestamp') fromTimestamp: string, @Query('toTimestamp') toTimestamp: string, @Req() req: Request) {  
    try {
      return await this.consumerService.consumeDataFromDataroom(producerId, bindingId, assetId, fromTimestamp, toTimestamp, req);
    } catch(err) {
      throw err;
    }
  }
  
}
