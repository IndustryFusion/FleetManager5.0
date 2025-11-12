import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import axios from 'axios';

@Injectable()
export class PurchasedPdtCacheService {
  private readonly ifxPlatformUrl = process.env.IFX_PLATFORM_BACKEND_URL;

  async create(company_ifric_id: string, asset_ifric_id: string, asset_cert_valid: string, req: Request) {
    try {
      const ifxHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization']
      };
      const response = await axios.post(`${this.ifxPlatformUrl}/purchased-pdt-cache/${company_ifric_id}/${asset_ifric_id}/${asset_cert_valid}`, {headers: ifxHeaders});
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if(err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
