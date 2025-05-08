import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ConsumerService {

  private readonly ifxConnector = process.env.IFX_CONNECTOR_BACKEND_URL;

  async getConsumerBindings(consumerId: string, contractType: string, contractId: string) {
    console.log('Consumer ID:', consumerId);
    console.log('Contract Type:', contractType);
    console.log('Contract ID:', contractId);

    const encodedConsumerId = encodeURIComponent(consumerId);
    const encodedContractType = encodeURIComponent(contractType);
    const encodedContractId = encodeURIComponent(contractId);
    try {
      const registryHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      const bindings = await axios.get(`${this.ifxConnector}/consumer/${encodedConsumerId}/${encodedContractType}/${encodedContractId}`, { headers: registryHeaders });
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
