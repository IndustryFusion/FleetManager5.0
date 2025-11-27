import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { Request } from 'express';
import { CompactEncrypt } from 'jose';
import { createHash } from 'crypto';

@Injectable()
export class ContractService {

  private readonly contractUrl = process.env.CONTRACT_BACKEND_URL;

  mask(input: string, key: string): string {
    return input.split('').map((char, i) =>
      (char.charCodeAt(0) ^ key.charCodeAt(i % key.length)).toString(16).padStart(2, '0')
    ).join('');
  }

  deriveKey(secret: string): Uint8Array {
    const hash = createHash('sha256');
    hash.update(secret);
    return new Uint8Array(hash.digest());
  }
  
  async encryptData(data: string) {
    const encoder = new TextEncoder();
    const encryptionKey = await this.deriveKey(process.env.JWT_SECRET);

    const encrypted = await new CompactEncrypt(encoder.encode(data))
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(encryptionKey);
    return encrypted;
  }

  async findAll(company_ifric_id: string, req: Request) {
    try {
      const contractHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization']
      };

      const response = await axios.get(`${this.contractUrl}/contract/get-company-contract/${company_ifric_id}`, {headers: contractHeaders});
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
