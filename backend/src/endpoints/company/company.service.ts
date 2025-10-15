import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { Request } from 'express';

@Injectable()
export class CompanyService {

  private readonly ifxPlatformUrl = process.env.IFX_PLATFORM_BACKEND_URL;

  async getAssetsAndOwnerDetails(company_ifric_id: string, req: Request) {
    try {
      const ifxHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization']
      };

      const response = await axios.get(`${this.ifxPlatformUrl}/pdt-asset-cache/get-assets-and-owner-details/${company_ifric_id}`, {headers: ifxHeaders});
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
