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


import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Req, Res, Session, Query, UseGuards } from '@nestjs/common';
import { AssetService } from './asset.service';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  async getAssetData(@Param('id') id: string, @Req() req: Request) {
    try {
      return await this.assetService.getAssetData(id, req);
    } catch (err) {
      throw new NotFoundException();
    }
  }

  @Get('/type/:type')
  async getAssetByType(@Param('type') type: string) {
    try {
      return await this.assetService.getAssetByType(atob(type));
    } catch (err) {
      throw new NotFoundException();
    }
  }

  @Get('getAssetById/:id')
  async getAssetDataById(@Param('id') id: string) {
    try {
      console.log("start")
      return await this.assetService.getAssetDataById(id);
    } catch (err) {
      throw new NotFoundException();
    }
  }

  @Get(':id/keyvalues')
  async getkeyValuesById(@Param('id') id: string) {
    try {
      return await this.assetService.getkeyValuesById(id);
    } catch (err) {
      throw new NotFoundException();
    }
  }

  @UseGuards(AuthGuard)
  @Get('get-company-manufacturer-asset/:id')
  async getManufacturerCompanyAsset(@Param('id') id: string, @Req() req: Request) {
    try {
      return await this.assetService.getManufacturerCompanyAsset(id, req);
    } catch (err) {
      throw err;
    }
  }

  @Post(':id')
  async setAssetData(@Param('id') id: string, @Body() data) {
    try {
      const response = await this.assetService.setAssetData(id, data);
      if(response['status'] == 200 || response['status'] == 201) {
        return {
          success: true,
          status: response['status'],
          message: response['statusText'],
          id: response['id'],
        }
      } else {
        return response;
      }
    } catch (err) {
      return { 
        success: false,
        message: err.response
      };
    }
  }

  @Patch(':id')
  async updateAssetById(@Param('id') id: string, @Body() data) {
    try {
      const response = await this.assetService.updateAssetById(id, data);
      if(response['status'] == 200 || response['status'] == 204) {
        return {
          success: true,
          status: response['status'],
          message: 'Updated Successfully',
        }
      } else {
        return response;
      }
    } catch (err) {
      return { 
        success: false, 
        status: err.response.status,
        message: err.response.data 
      };
    }
  }

  @Delete(':id')
  async deleteAssetById(@Param('id') id: string) {
    try {
      const response = await this.assetService.deleteAssetById(id);
      if(response['status'] == 200 || response['status'] == 204) {
        return {
          success: true,
          status: response['status'],
          message: 'Deleted Successfully',
        }
      }
    } catch (err) {
      return { 
        success: false, 
        status: err.response.status,
        message: err.response.data 
      };
    }
  }
}
