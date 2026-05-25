import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModuleResponseDto } from './dtos/module.dto';

@Controller('modules')
export class ModulesController {
  constructor(private modulesService: ModulesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ModuleResponseDto> {
    return this.modulesService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<ModuleResponseDto> {
    return this.modulesService.findOne(id);
  }

  @Get('key/:key')
  @HttpCode(HttpStatus.OK)
  async findByKey(@Param('key') key: string): Promise<ModuleResponseDto> {
    return this.modulesService.findByKey(key);
  }
}
