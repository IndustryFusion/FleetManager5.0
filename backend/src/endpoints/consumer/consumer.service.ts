import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Request } from 'express';

@Injectable()
export class ConsumerService {

  private readonly ifxConnector = process.env.IFX_CONNECTOR_BACKEND_URL;

  async getConsumerBindings(consumerId: string, req: Request) {
    console.log('Consumer ID:', consumerId);

    const encodedConsumerId = encodeURIComponent(consumerId);
    try {
      const registryHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // IFXConnector requires a login and passes the token on to PDT.
        'Authorization': req.headers['authorization'],
      };
      const bindings = await axios.get(`${this.ifxConnector}/consumer/${encodedConsumerId}`, { headers: registryHeaders });
      return bindings.data;
    } catch (err) {
      throw err;
    }
  }

  async consumeDataFromDataroom(producerId: string, bindingId: string, assetId: string, fromTimestamp: string, toTimestamp: string, req: Request) {
    try {
      const registryHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // IFXConnector requires a login and passes the token on to PDT.
        'Authorization': req.headers['authorization'],
      };
      const data = await axios.get(`${this.ifxConnector}/consumer/consume-data-from-dataroom/${encodeURIComponent(producerId)}/${encodeURIComponent(bindingId)}/${encodeURIComponent(assetId)}?fromTimestamp=${encodeURIComponent(fromTimestamp)}&toTimestamp=${encodeURIComponent(toTimestamp)}`, { headers: registryHeaders });
      return data.data;
    } catch (err) {
      throw err;
    }
  }
}
