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

  @Get(':id')
  getTemplateById(@Param('id') id: string): Promise<TemplateDescriptionDto[]> {
    try {
      return this.templatesService.getTemplateById(id);
    } catch (err) {
      throw new NotFoundException();
    }
  }
  
}
