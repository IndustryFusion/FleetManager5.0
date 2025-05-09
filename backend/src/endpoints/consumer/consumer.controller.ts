import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { ConsumerService } from './consumer.service';

@Controller('consumer')
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}

  @Get('get-consumer-bindings/:consumerId')
  async getConsumerBindings(@Param('consumerId') consumerId: string) {
    try {
      return await this.consumerService.getConsumerBindings(consumerId);
    } catch(err) {
      throw err;
    }
  }

  @Get('consume-data-from-dataroom/:producerId/:bindingId/:assetId')
  async consumeDataFromDataroom(@Param('producerId') producerId: string, @Param('bindingId') bindingId: string, @Param('assetId') assetId: string, @Query('fromTimestamp') fromTimestamp: string, @Query('toTimestamp') toTimestamp: string) {  
    try {
      return await this.consumerService.consumeDataFromDataroom(producerId, bindingId, assetId, fromTimestamp, toTimestamp);
    } catch(err) {
      throw err;
    }
  }
  
}
