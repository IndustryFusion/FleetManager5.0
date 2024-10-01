import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CreateCompanyCertificateDto, CreateAssetCertificateDto } from './dto/create-certificate.dto';

@Controller('certificate')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post('create-company-certificate')
  async generateCompanyCertificate(@Body() data: CreateCompanyCertificateDto, @Req() req: Request) {
    try {
      return await this.certificateService.generateCompanyCertificate(data.company_ifric_id, new Date(data.expiry), data.user_email, req);
    } catch(err) {
      return { 
        success: false, 
        status: err?.response?.status,
        message: 'Failed to generate certificate',
        error: err.message
      };
    }
  }

  @Get('get-company-certificates/:company_ifric_id')
  async getCompanyCertificates(@Param('company_ifric_id') company_ifric_id: string, @Req() req: Request) {
    try {
      return await this.certificateService.getCompanyCertificates(company_ifric_id, req);
    } catch(err) {
      throw err;
    }
  }

  @Get('verify-company-certificate/:company_ifric_id')
  async verifyCompanyCertificate(@Param('company_ifric_id') company_ifric_id: string, @Req() req: Request) {
    try {
      const response = await this.certificateService.verifyCompanyCertificate(company_ifric_id, req);
      return response;
    } catch(err) {
      return { 
        success: false,
        status: err?.response?.status,
        message: 'Failed to fetch certificate',
        error: err.message
      };
    }
  }

  @Post('create-asset-certificate')
  async generateAssetCertificate(@Body() data: CreateAssetCertificateDto, @Req() req: Request) {
    try {
      return await this.certificateService.generateAssetCertificate(data.company_ifric_id, data.asset_ifric_id, data.user_email, new Date(data.expiry), req);
    } catch(err) {
      return { 
        success: false, 
        status: err?.response?.status,
        message: 'Failed to generate certificate',
        error: err.message
      };
    }
  }

  @Get('get-asset-certificates') 
  async getAssetCertificates(@Query('asset_ifric_id') asset_ifric_id: string, @Query('company_ifric_id') company_ifric_id: string, @Req() req: Request) {
    try {
      return await this.certificateService.getAssetCertificates(asset_ifric_id, company_ifric_id, req);
    } catch(err) {
      return { 
        success: false, 
        status: err?.response?.status,
        message: 'Failed to fetch certificate',
        error: err.message
      };
    }
  }

  @Get('verify-asset-certificate')
  async verifyAssetCertificate(@Query('asset_ifric_id') asset_ifric_id: string, @Query('company_ifric_id') company_ifric_id: string, @Req() req: Request) {
    try {
      const response = await this.certificateService.verifyAssetCertificate(asset_ifric_id, company_ifric_id, req);
      return response;  
    } catch(err) {
      throw err;
    }
  }
}
