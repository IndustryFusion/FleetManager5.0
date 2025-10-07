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

import { Controller, Post, Body, Get, Req} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FindOneAuthDto, FindIndexedDbAuthDto } from './dto/find-auth-dto';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  userLogin(@Body() data: FindOneAuthDto) {
    try {
      return this.authService.logIn(data);
    } catch (err) {
      throw new err;
    }
  }

  @Post('get-indexed-db-data')
  getIndexedData(@Body() data: FindIndexedDbAuthDto) {
    try {
      return this.authService.getIndexedData(data);
    } catch (err) {
      throw err;
    }
  }

  @Get('get-all-companies')
  getAllCompanies(@Req() req: Request) {
    return this.authService.getAllCompanies(req);
  }
}
