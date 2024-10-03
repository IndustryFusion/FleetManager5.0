// 
// Copyright (c) 2024 IB Systems GmbH 
// 
// Licensed under the Apache License, Version 2.0 (the "License"); 
// you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at 
// 
//   http://www.apache.org/licenses/LICENSE-2.0 
// 
// Unless required by applicable law or agreed to in writing, software 
// distributed under the License is distributed on an "AS IS" BASIS, 
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
// See the License for the specific language governing permissions and 
// limitations under the License. 
// 

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { FindOneAuthDto, FindIndexedDbAuthDto } from './dto/find-auth-dto';
import * as jwt from 'jsonwebtoken';

/**
 * Retrieves tokens from the keylock service.
 * Returns access and refresh tokens.
 * @throws {Error} Throws an error if there is a invalid credentials.
 * Expected behavior:
 * - Positive Test Case: Successful retrieval of tokens with HTTP status code 200.
 * - Negative Test Case: Throws invalid credentials in case of failure.
 */
@Injectable()
export class AuthService {
  private readonly registryUrl = process.env.IFRIC_REGISTRY_BACKEND_URL;
  private readonly SECRET_KEY = process.env.JWT_SECRET_KEY;

  async logIn(data: FindOneAuthDto) {
    try {
      // Find User From IFRIC Registry
      
      let registryResponse = await axios.post(
        `${this.registryUrl}/auth/login`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (registryResponse.data.status == '200') {
        return registryResponse.data;
      } else {
        return {
          success: false,
          status: registryResponse.data.status,
          message: registryResponse.data.message,
        };
      }
    } catch (err) {
      return {
        success: false,
        status: 500,
        message: 'Error Fetching User',
        error: err.message,
      };
    }
  }

  async getIndexedData(data: FindIndexedDbAuthDto) {
    try {
      const decoded = jwt.verify(data.token, this.SECRET_KEY);

      // Check if there's an inner token
      if (decoded.token) {
        const decodedToken = jwt.decode(decoded.token);

        const registryHeader = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${decoded.token}`
        };
        const response = await axios.post(`${this.registryUrl}/auth/get-indexed-db-data`,{
            company_id: decodedToken?.sub,
            email: decodedToken?.user,
            product_name: data.product_name
        }, {
          headers: registryHeader
        });
        return response.data;
      }
      
    }catch(err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      if(err?.response?.status == 401) {
        throw new UnauthorizedException();
      }
      throw new NotFoundException(`Failed to fetch indexed data: ${err.message}`);
    }
  }
}