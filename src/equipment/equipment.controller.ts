import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, NotFoundException } from '@nestjs/common';
import { GymDataService } from '@/shared/gym-data.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly gymData: GymDataService) {}

  @Get()
  async findAll(@Query() query: { page?: number; limit?: number; search?: string; category?: string; status?: string }) {
    return { success: true, data: await this.gymData.listEquipment(query) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const equipment = await this.gymData.getEquipment(id);
    if (!equipment) throw new NotFoundException(`Equipment with ID ${id} not found`);
    return { success: true, data: equipment };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any) {
    return { success: true, data: await this.gymData.createEquipment(body) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const equipment = await this.gymData.updateEquipment(id, body);
    if (!equipment) throw new NotFoundException(`Equipment with ID ${id} not found`);
    return { success: true, data: equipment };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    const deleted = await this.gymData.deleteEquipment(id);
    if (!deleted) throw new NotFoundException(`Equipment with ID ${id} not found`);
    return { success: true, message: 'Equipment eliminado correctamente' };
  }

  @Get(':id/maintenance')
  async getMaintenanceHistory(@Param('id') id: string) {
    return { success: true, data: await this.gymData.getMaintenanceHistory(id) };
  }

  @Post(':id/maintenance')
  @HttpCode(HttpStatus.CREATED)
  async scheduleMaintenance(@Param('id') id: string, @Body() body: any) {
    const record = await this.gymData.scheduleMaintenance(id, body);
    if (!record) throw new NotFoundException(`Equipment with ID ${id} not found`);
    return { success: true, data: record };
  }

  @Patch(':id/maintenance/:maintenanceId/complete')
  async completeMaintenance(
    @Param('id') id: string,
    @Param('maintenanceId') maintenanceId: string,
    @Body() body: { notes?: string },
  ) {
    const record = await this.gymData.completeMaintenance(id, maintenanceId, body?.notes);
    if (!record) throw new NotFoundException(`Maintenance record with ID ${maintenanceId} not found`);
    return { success: true, data: record };
  }
}
