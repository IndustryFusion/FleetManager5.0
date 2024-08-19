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

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { FindOneAuthDto } from './dto/find-auth-dto';

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
}