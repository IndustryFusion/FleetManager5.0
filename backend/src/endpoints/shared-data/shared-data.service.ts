import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataAlertsEntity } from './dto/data-alerts.entity';
import { DataEventsEntity } from './dto/data-events.entity';
import { DataSeriesEntity } from './dto/data-series.entity';
import * as mqtt from 'mqtt';

@Injectable()
export class SharedDataService implements OnModuleInit{
    private client: mqtt.MqttClient;

    constructor(
        @InjectRepository(DataAlertsEntity)
        private readonly data1Repository: Repository<DataAlertsEntity>,
        @InjectRepository(DataAlertsEntity)
        private readonly data2Repository: Repository<DataEventsEntity>,
        @InjectRepository(DataAlertsEntity)
        private readonly data3Repository: Repository<DataSeriesEntity>,
    ) { }

    async onModuleInit() {
        this.client = mqtt.connect(process.env.SHARED_MQTT_URL);

        this.client.subscribe('if-x/alerts', (err, granted) => {
            if (err) {
                console.error(`Error subscribing to topic1: ${err.message}`);
            } else {
                console.log(`Subscribed to topic1: ${JSON.stringify(granted)}`);
            }
        });

        // this.client.subscribe('topic2/#', (err, granted) => {
        //     if (err) {
        //         console.error(`Error subscribing to topic2: ${err.message}`);
        //     } else {
        //         console.log(`Subscribed to topic2: ${JSON.stringify(granted)}`);
        //     }
        // });

        this.client.on('message', this.handleMessage.bind(this));
    }


    async handleMessage(topic: string, payload: Buffer) {
        if (topic == 'if-x/alerts') {
            const jsonRes = JSON.parse(payload.toString());
            for (const item of jsonRes) {
                var data = new DataAlertsEntity();
                data.environment = item.environment;
                data.event = item.event;
                data.group = item.group;
                data.urn_id = item.id;
                data.receiveTime = item.receiveTime;
                data.resource = item.resource;
                data.severity = item.severity;
                data.text = item.text;
                await this.data1Repository.save(data);
            }
        }
        //else if (topic.startsWith('topic2')) {
        //   const data = new DataAlertsEntity();
        //   data.topic = topic;
        //   data.payload = payload;
        //   await this.data2Repository.save(data);
        // }
    }
}
