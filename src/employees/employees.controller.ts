import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dtos/employee.dto';
import { EmployeesService } from './employees.service';
import { CurrentGymId } from '@/common/decorators/current-user.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async findAll(@CurrentGymId() gymId: string) {
    return { success: true, data: await this.employeesService.findAll(gymId) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentGymId() gymId: string) {
    return { success: true, data: await this.employeesService.findOne(id, gymId) };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateEmployeeDto, @CurrentGymId() gymId: string) {
    return { success: true, data: await this.employeesService.create(body, gymId) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateEmployeeDto, @CurrentGymId() gymId: string) {
    return { success: true, data: await this.employeesService.update(id, body, gymId) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentGymId() gymId: string) {
    return { success: true, data: await this.employeesService.delete(id, gymId) };
  }
}
