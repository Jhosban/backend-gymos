import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dtos/employee.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async findAll() {
    return { success: true, data: await this.employeesService.findAll() };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { success: true, data: await this.employeesService.findOne(id) };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateEmployeeDto) {
    return { success: true, data: await this.employeesService.create(body) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateEmployeeDto) {
    return { success: true, data: await this.employeesService.update(id, body) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return { success: true, data: await this.employeesService.delete(id) };
  }
}
