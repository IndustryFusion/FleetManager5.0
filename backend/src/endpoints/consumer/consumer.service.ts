import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ConsumerService {

  private readonly ifxConnector = process.env.IFX_CONNECTOR_BACKEND_URL;

  async getConsumerBindings(consumerId: string) {
    console.log('Consumer ID:', consumerId);

    const encodedConsumerId = encodeURIComponent(consumerId);
    try {
      const registryHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      const bindings = await axios.get(`${this.ifxConnector}/consumer/${encodedConsumerId}`, { headers: registryHeaders });
      return bindings.data;
    } catch (err) {
      throw err;
    }
  }

  async consumeDataFromDataroom(producerId: string, bindingId: string, assetId: string, fromTimestamp: string, toTimestamp: string) {
    try {
      const registryHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      const data = await axios.get(`${this.ifxConnector}/consumer/consume-data-from-dataroom/${producerId}/${bindingId}/${assetId}?fromTimestamp=${fromTimestamp}&toTimestamp=${toTimestamp}`, { headers: registryHeaders });
      return data.data;
    } catch (err) {
      throw err;
    }
  }
}
