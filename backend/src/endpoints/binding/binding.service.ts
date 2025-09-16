import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateBindingDto, UpdateBindingDto } from './dto/binding.dto';
import axios from 'axios';

@Injectable()
export class BindingService {
  private readonly contractUrl = process.env.CONTRACT_BACKEND_URL;

  async create(data: CreateBindingDto) {
    try {
      const response = await axios.post(`${this.contractUrl}/binding`, data);
      return response.data;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getContractDetailsByBindingCompany(company_ifric_id: string) {
    try {
      const response = await axios.get(`${this.contractUrl}/binding/get-contract-details-by-binding-company/${company_ifric_id}`);
      return response.data;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
