import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ContractService {

  private readonly contractUrl = process.env.CONTRACT_BACKEND_URL;

  async findAll(company_ifric_id: string) {
    try {
      const response = await axios.get(`${this.contractUrl}/contract/get-company-contract/${company_ifric_id}`);
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if(err.response) {
        throw new HttpException(err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }
}
