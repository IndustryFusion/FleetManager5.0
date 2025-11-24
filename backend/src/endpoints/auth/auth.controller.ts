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

import { Controller, Post, Body, Get, Req, UseGuards, Param, Query, Patch, Delete} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FindOneAuthDto, FindIndexedDbAuthDto, EncryptRouteDto, CompanyTwinDto } from './dto/find-auth-dto';
import { Request } from 'express';
import { AuthGuard } from './auth.guard';
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

  @UseGuards(AuthGuard)
  @Post('encrypt-route')
  encryptRoute(@Body() data: EncryptRouteDto, @Req() req: Request) {
    try {
      return this.authService.encryptRoute(data, req);
    } catch (err) {
      throw err;
    }
  }

  @Post('decrypt-route')
  decryptRoute(@Body() data: FindIndexedDbAuthDto) {
    try {
      return this.authService.decryptRoute(data);
    } catch (err) {
      throw err;
    }
  }

  @UseGuards(AuthGuard)
  @Get('get-all-companies')
  getAllCompanies(@Req() req: Request) {
    return this.authService.getAllCompanies(req);
  }

  @UseGuards(AuthGuard)
  @Get('/get-user-details-by-email/:email')
  getUserDetailsByEmail(@Param('email') email: string, @Req() req: Request) {
    return this.authService.getUserDetailsByEmail(email, req);
  }

  @UseGuards(AuthGuard)
  @Get('/get-company-details/:company_ifric_id')
  getCompanyDetails(@Param('company_ifric_id') company_ifric_id: string, @Req() req: Request) {
    return this.authService.getCompanyDetails(company_ifric_id, req);
  }

  @UseGuards(AuthGuard)
  @Get('/get-company-details-id/:id')
  getCompanyDetailsByID(@Param('id') id: string, @Req() req: Request) {
    return this.authService.getCompanyDetailsbyRecord(id, req);
  }

  @UseGuards(AuthGuard)
  @Get('/get-category-specific-company/:categoryName')
  getCategorySpecificCompanies(@Param('categoryName') categoryName: string, @Req() req: Request) {
    return this.authService.getCategorySpecificCompanies(categoryName, req);
  }

  @UseGuards(AuthGuard)
  @Get('/get-user-details')
  getUserDetails(@Query('user_email') user_email: string, @Query('company_ifric_id') company_ifric_id: string, @Req() req: Request) {
    return this.authService.getUserDetails(user_email, company_ifric_id, req);
  }

  @UseGuards(AuthGuard)
  @Get('/get-company-products/:company_ifric_id')
  getCompanyProducts(@Param('company_ifric_id') company_ifric_id: string, @Req() req: Request) {
    return this.authService.getCompanyProducts(company_ifric_id, req);
  }

  @UseGuards(AuthGuard)
  @Post('/create-access-group/:company_ifric_id')
  createAccessGroup(@Param('company_ifric_id') company_ifric_id: string, @Body() data: Record<string,any>, @Req() req: Request) {
    return this.authService.createAccessGroup(company_ifric_id, data, req);
  }

  @UseGuards(AuthGuard)
  @Get('/get-company-access-group/:company_ifric_id')
  getCompanyAccessGroup(@Param('company_ifric_id') company_ifric_id: string, @Req() req: Request) {
    return this.authService.getCompanyAccessGroup(company_ifric_id, req);
  }

  @UseGuards(AuthGuard)
  @Get('/get-company-users/:id')
  getCompanyUsers(@Param('id') id: string, @Req() req: Request) {
    return this.authService.getCompanyUsers(id, req);
  }

  @UseGuards(AuthGuard)
  @Get('/get-user-product-access/:id')
  getUserProductAccess(@Param('id') id: string, @Req() req: Request) {
    return this.authService.getUserProductAccess(id, req);
  }

  @UseGuards(AuthGuard)
  @Get('/get-access-group/:id')
  getAccessGroup(@Param('id') id: string,  @Req() req: Request) {
    return this.authService.getAccessGroup(id, req);
  }

  @UseGuards(AuthGuard)
  @Patch('/update-access-group/:id')
  updateAccessGroup(@Param('id') id: string, @Body() data: Record<string,any>, @Req() req: Request) {
    return this.authService.updateAccessGroup(id, data, req);
  }

  @UseGuards(AuthGuard)
  @Patch('/update-company-twin')
  updateCompanyTwin(@Body() data: CompanyTwinDto, @Req() req: Request) {
    return this.authService.updateCompanyTwin(data, req);
  }

  @UseGuards(AuthGuard)
  @Delete('/delete-access-group/:id')
  deleteAccessgroup(@Param('id') id: string, @Req() req: Request) {
    return this.authService.deleteAccessgroup(id, req);
  }

  @UseGuards(AuthGuard)
  @Delete('/delete-company-user/:id')
  deleteCompanyUser(@Param('id') id: string, @Req() req: Request) {
    return this.authService.deleteCompanyUser(id, req);
  }
}
