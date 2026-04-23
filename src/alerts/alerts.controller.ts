import { Controller, Get, HttpCode, HttpStatus, Param, Patch, Query, NotFoundException } from '@nestjs/common';
import { GymDataService } from '@/shared/gym-data.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly gymData: GymDataService) {}

  @Get()
  async findAll(@Query() query: { status?: string; severity?: string }) {
    return { success: true, data: await this.gymData.listAlerts(query) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const alert = await this.gymData.getAlert(id);
    if (!alert) throw new NotFoundException(`Alert with ID ${id} not found`);
    return { success: true, data: alert };
  }

  @Patch(':id/resolve')
  @HttpCode(HttpStatus.OK)
  async resolve(@Param('id') id: string) {
    const alert = await this.gymData.resolveAlert(id);
    if (!alert) throw new NotFoundException(`Alert with ID ${id} not found`);
    return { success: true, data: alert };
  }
}
