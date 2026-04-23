import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, NotFoundException } from '@nestjs/common';
import { GymDataService } from '@/shared/gym-data.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly gymData: GymDataService) {}

  @Get()
  async findAll(@Query() query: { page?: number; limit?: number; search?: string; status?: string }) {
    return { success: true, data: await this.gymData.listLeads(query) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const lead = await this.gymData.getLead(id);
    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);
    return { success: true, data: lead };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: any) {
    return { success: true, data: await this.gymData.createLead(body) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const lead = await this.gymData.updateLead(id, body);
    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);
    return { success: true, data: lead };
  }

  @Patch(':id/status')
  async move(@Param('id') id: string, @Body() body: { status: string }) {
    const lead = await this.gymData.moveLead(id, body.status as any);
    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);
    return { success: true, data: lead };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    const deleted = await this.gymData.deleteLead(id);
    if (!deleted) throw new NotFoundException(`Lead with ID ${id} not found`);
    return { success: true, message: 'Lead eliminado correctamente' };
  }
}
