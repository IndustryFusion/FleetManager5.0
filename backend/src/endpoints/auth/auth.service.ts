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

import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { FindOneAuthDto, FindIndexedDbAuthDto, EncryptRouteDto, CompanyTwinDto } from './dto/find-auth-dto';
import * as jwt from 'jsonwebtoken';
import { CompactEncrypt } from 'jose';
import { createHash } from 'crypto';
import { Request } from 'express';
import { compactDecrypt } from 'jose';

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
  private readonly SECRET_KEY = process.env.JWT_SECRET!;
  private readonly MASK_SECRET = process.env.MASK_SECRET!;

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

  async encryptRoute(data: EncryptRouteDto, req: Request) {
    try { 
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: req.headers['authorization'],
      };

      // check whether the product is installed or not
      const companyProducts = await axios.get(`${this.registryUrl}/auth/get-company-products/${data.company_ifric_id}`,{
        headers: registryHeader
      });
      const installed = Array.isArray(companyProducts.data) &&
                      companyProducts.data.some((p: any) => p.product_name === data.product_name);

      if (!installed) {
        throw new HttpException(`product is not installed, please install ${data.product_name}`, HttpStatus.NOT_FOUND);
      }

      // encrypt the token with 30s expiry
      const otp = new Date().toISOString();     
      const maskedJwt = data.token;
      
      const routeToken = jwt.sign(
        { m: maskedJwt, product: data.product_name, otp },
        this.SECRET_KEY,
        { expiresIn: '30s' },
      );
      
      // return the route with excrypted token
      const url = new URL(data.route);
      url.searchParams.set("token", routeToken);
      return { path: url.toString() };
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async decryptRoute(data: FindIndexedDbAuthDto) {
    try {
      const routeToken = data.token
      const { m: maskedJwt } = jwt.verify(routeToken, this.SECRET_KEY) as { m: string };
      const registryJwt = this.unmask(maskedJwt, this.MASK_SECRET);
      const decoded = jwt.decode(registryJwt) as
        | { sub?: string; user?: string; iat?: number; exp?: number }
        | null;
    

      if (!decoded) {
        throw new HttpException('Cannot decode registryJwt', HttpStatus.UNAUTHORIZED);
      }

          const registryHeader = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: `Bearer ${registryJwt}`,
          };
            const registryResponse = await axios.post(
        `${this.registryUrl}/auth/get-indexed-db-data`,
        {
          company_id:   decoded.sub,
          email:        decoded.user,
          product_name:data.product_name,
        },
        { headers: registryHeader },
      );
          if (registryResponse.data) {
            const encryptedToken = await this.encryptData(registryResponse.data.data.jwt_token);
            registryResponse.data.data.ifricdi = this.mask(encryptedToken, process.env.MASK_SECRET);
            delete registryResponse.data.data.jwt_token;
            return registryResponse.data;
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
  private  mask(input: string, key: string): string {
    return input.split('').map((char, i) =>
      (char.charCodeAt(0) ^ key.charCodeAt(i % key.length)).toString(16).padStart(2, '0')
    ).join('');
  }

  private unmask(masked: string, key: string): string {
    if (!key) {
      throw new Error("Mask secret is not defined");
    }
    const bytes = masked.match(/.{1,2}/g)!.map((h) => parseInt(h, 16));
    return String.fromCharCode(
      ...bytes.map((b, i) => b ^ key.charCodeAt(i % key.length))
    );
  }
    
  deriveKey(secret: string): Uint8Array {
    const hash = createHash('sha256');
    hash.update(secret);
    return new Uint8Array(hash.digest());
  }
  async encryptData(data: string) {
    const encoder = new TextEncoder();
    const encryptionKey = await this.deriveKey(this.SECRET_KEY);

    const encrypted = await new CompactEncrypt(encoder.encode(data))
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(encryptionKey);
    return encrypted;
  }

  async getAllCompanies(req: Request) {
    try {
      const registryHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization']
      }
      const response = await axios.get(`${this.registryUrl}/auth/get-all-companies`, {headers: registryHeaders});
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

  async getUserDetailsByEmail(email: string, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.get(`${this.registryUrl}/auth/get-user-details-by-email/${email}`,{ headers: registryHeader });
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

  async getCompanyDetails(company_ifric_id: string, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.get(`${this.registryUrl}/auth/get-company-details/${company_ifric_id}`,{ headers: registryHeader });
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

  async getCompanyDetailsbyRecord(id: string, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.get(`${this.registryUrl}/auth/get-company-details-id/${id}`,{ headers: registryHeader });
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

  async getCategorySpecificCompanies(categoryName: string, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.get(`${this.registryUrl}/auth/get-category-specific-company/${categoryName}`,{ headers: registryHeader });
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

  async getUserDetails(user_email, company_ifric_id, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.get(`${this.registryUrl}/auth/get-user-details`, {
            headers: registryHeader,
            params: {
              user_email, 
              company_ifric_id
            },
        });
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

  async getCompanyProducts(company_ifric_id: string, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.get(`${this.registryUrl}/auth/get-company-products/${company_ifric_id}`,{ headers: registryHeader });
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

  async updateCompanyTwin(data: CompanyTwinDto, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.patch(`${this.registryUrl}/auth/update-company-twin`, data,{ headers: registryHeader });
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

  async createAccessGroup(company_ifric_id: string, data: Record<string,any>, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.post(`${this.registryUrl}/auth/create-access-group/${company_ifric_id}`, data, {headers: registryHeader })
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

  async updateAccessGroup(id: string, data: Record<string,any>, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.patch(`${this.registryUrl}/auth/update-access-group/${id}`, data,{ headers: registryHeader });
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

  async deleteAccessgroup(id: string, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.delete(`${this.registryUrl}/auth/delete-access-group/${id}`,{ headers: registryHeader });
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

  async getCompanyAccessGroup(company_ifric_id: string, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.get(`${this.registryUrl}/auth/get-company-access-group/${company_ifric_id}`,{ headers: registryHeader });
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

  async getCompanyUsers(company_ifric_id: string, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.get(`${this.registryUrl}/auth/get-company-users/${company_ifric_id}`,{ headers: registryHeader });
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

  async getUserProductAccess(id: string, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.get(`${this.registryUrl}/auth/get-user-product-access/${id}`,{ headers: registryHeader });
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

  async getAccessGroup(id: string, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.get(`${this.registryUrl}/auth/get-access-group/${id}`,{ headers: registryHeader });
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

  async authenticateToken(ifricdi: string) {
    try {
      // unMask the token
      const unMaskedToken = this.unmask(ifricdi, this.MASK_SECRET);

      // Decrypt the token
      const ENCRYPTION_KEY = this.deriveKey(process.env.JWT_SECRET!);
      const { plaintext } = await compactDecrypt(unMaskedToken, ENCRYPTION_KEY);
      const decryptedToken = new TextDecoder().decode(plaintext);

      // verify the token and return true if autheticated
      const response = await axios.get(`${this.registryUrl}/auth/authenticate-token/${decryptedToken}`);
      return response.data;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else if(err.response) {
        throw new HttpException(err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async deleteCompanyUser(id: string, req: Request) {
    try {
      const registryHeader = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers['authorization'],
      };
      const response = await axios.delete(`${this.registryUrl}/auth/delete-company-user/${id}`,{ headers: registryHeader });
      return response.data;
    } catch(err) {
      if (err instanceof HttpException) {
        throw err;
      } else if (err.response) {
        throw new HttpException(err.response.data.title || err.response.data.message, err.response.status);
      } else {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
    }
  }

}

  