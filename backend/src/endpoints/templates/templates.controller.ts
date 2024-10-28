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

import { Controller, Get, Param, NotFoundException, Query } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplateDto } from './dto/template.dto';
import { TemplateDescriptionDto } from './dto/templateDescription.dto';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  getTemplates(): Promise<TemplateDto[]> {
    try {
      return this.templatesService.getTemplates();
    } catch (err) {
      throw new NotFoundException();
    }
  }

  @Get('/template-name')
  getTemplateByName(@Query('name') name: string): Promise<TemplateDescriptionDto[]> {
    try {
      return this.templatesService.getTemplateByName(name);
    } catch (err) {
      throw new NotFoundException();
    }
  }

  @Get('/contract/:id')
  getContractTemplateById(@Param('id') id: string): Promise<TemplateDescriptionDto[]> {
    try {
      console.log("id ",id);
      return this.templatesService.getContractTemplateById(id);
    } catch (err) {
      throw new NotFoundException();
    }
  }

  @Get(':id')
  getTemplateById(@Param('id') id: string): Promise<TemplateDescriptionDto[]> {
    try {
      return this.templatesService.getTemplateById(id);
    } catch (err) {
      throw new NotFoundException();
    }
  }
  
}
