import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, MqttContext } from '@nestjs/microservices';
import { SharedDataService } from './shared-data.service';

@Controller('shared-data')
export class SharedDataController {
    // constructor(private readonly sharedDataService: SharedDataService) { }

    // @MessagePattern('if-x/alerts')
    // async handleTopic1(@Payload() payload: any, @Ctx() context: MqttContext) {
    //     const topic = context.getTopic();
    //     console.log(topic);
    //     await this.sharedDataService.handleMessage(topic, payload);
    // }

    // @MessagePattern('topic2/#')
    // async handleTopic2(@Payload() payload: any, @Ctx() context: MqttContext) {
    //     const topic = context.getTopic();
    //     await this.sharedDataService.handleMessage(topic, payload);
    // }
}
