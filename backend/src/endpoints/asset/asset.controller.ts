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


import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Req, Res, Session, Query } from '@nestjs/common';
import { AssetService } from './asset.service';
import { Request } from 'express';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  async getTemplateData(@Req() req: Request, @Query('type') type: string) {
    try {
      if (type) {
        return this.getAssetByType(type);
      } else {
      return await this.assetService.getTemplateData();
      }
    } catch (err) {
      throw new NotFoundException();
    }
  }

  @Get('type=:type')
  async getAssetByType(type: string) {
    try {
      return await this.assetService.getAssetByType(type);
    } catch (err) {
      throw new NotFoundException();
    }
  }

  @Get(':id')
  async getTemplateDataById(@Param('id') id: string, @Req() req: Request) {
    try {
      return await this.assetService.getTemplateDataById(id);
    } catch (err) {
      throw new NotFoundException();
    }
  }

  @Get(':id/keyvalues')
  async getkeyValuesById(@Param('id') id: string, @Req() req: Request) {
    try {
      return await this.assetService.getkeyValuesById(id);
    } catch (err) {
      throw new NotFoundException();
    }
  }

  @Post(':id')
  async setTemplateData(@Param('id') id: string, @Body() data, @Req() req: Request) {
    try {
      const response = await this.assetService.setTemplateData(id, data);
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
  async updateAssetById(@Param('id') id: string, @Body() data, @Req() req: Request) {
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
  async deleteAssetById(@Param('id') id: string, @Req() req: Request) {
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
