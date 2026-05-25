import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dtos/employee.dto';

type EmployeeResponse = {
  id: string;
  employeeId: string;
  fullName: string;
  role: string;
  schedule: string;
  salary: number;
  photoUrl: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};

type NormalizedEmployeeInput = {
  identification?: string;
  name?: string;
  position?: string;
  scheduleDays?: string[];
  startTime?: string;
  endTime?: string;
  salary?: number;
  photoUrl?: string | null;
  email?: string;
  phone?: string;
  status?: string;
};

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<EmployeeResponse[]> {
    const employees = await this.prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return employees.map((employee) => this.toResponse(employee));
  }

  async findOne(id: string): Promise<EmployeeResponse> {
    const employee = await this.prisma.employee.findUnique({ where: { id } });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return this.toResponse(employee);
  }

  async create(dto: CreateEmployeeDto): Promise<EmployeeResponse> {
    const data = this.normalizeInput(dto, true) as Prisma.EmployeeCreateInput;

    try {
      const employee = await this.prisma.employee.create({ data });
      return this.toResponse(employee);
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<EmployeeResponse> {
    await this.ensureExists(id);
    const data = this.normalizeInput(dto, false) as Prisma.EmployeeUpdateInput;

    try {
      const employee = await this.prisma.employee.update({
        where: { id },
        data,
      });
      return this.toResponse(employee);
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.ensureExists(id);
    await this.prisma.employee.delete({ where: { id } });

    return { message: 'Empleado eliminado correctamente' };
  }

  private async ensureExists(id: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
  }

  private normalizeInput(dto: CreateEmployeeDto | UpdateEmployeeDto, requireRequiredFields: boolean): NormalizedEmployeeInput {
    const schedule = this.resolveSchedule(dto);
    const identification = dto.identification ?? dto.employeeId;
    const name = dto.name ?? dto.fullName;
    const position = dto.position ?? dto.role;
    const status = dto.status ? this.toDatabaseStatus(dto.status) : requireRequiredFields ? 'ACTIVO' : undefined;

    if (requireRequiredFields) {
      const missingFields: string[] = [];
      if (!identification) missingFields.push('employeeId');
      if (!name) missingFields.push('fullName');
      if (!position) missingFields.push('role');
      if (!schedule.scheduleDays?.length) missingFields.push('schedule');
      if (!schedule.startTime) missingFields.push('startTime');
      if (!schedule.endTime) missingFields.push('endTime');
      if (dto.salary === undefined || dto.salary === null) missingFields.push('salary');
      if (!dto.email) missingFields.push('email');
      if (!dto.phone) missingFields.push('phone');

      if (missingFields.length > 0) {
        throw new ConflictException(`Missing required fields: ${missingFields.join(', ')}`);
      }
    }

    const data: NormalizedEmployeeInput = {};
    if (identification !== undefined) data.identification = identification;
    if (name !== undefined) data.name = name;
    if (position !== undefined) data.position = position;
    if (schedule.scheduleDays !== undefined) data.scheduleDays = schedule.scheduleDays;
    if (schedule.startTime !== undefined) data.startTime = schedule.startTime;
    if (schedule.endTime !== undefined) data.endTime = schedule.endTime;
    if (dto.salary !== undefined) data.salary = dto.salary;
    if (dto.photoUrl !== undefined) data.photoUrl = dto.photoUrl || null;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (status !== undefined) data.status = status;

    return data;
  }

  private resolveSchedule(dto: CreateEmployeeDto | UpdateEmployeeDto): { scheduleDays?: string[]; startTime?: string; endTime?: string } {
    if (dto.scheduleDays || dto.startTime || dto.endTime) {
      return {
        scheduleDays: dto.scheduleDays,
        startTime: dto.startTime,
        endTime: dto.endTime,
      };
    }

    if (!dto.schedule) {
      return {};
    }

    return this.parseSchedule(dto.schedule);
  }

  private parseSchedule(schedule: string): { scheduleDays: string[]; startTime: string; endTime: string } {
    const [daysPart = '', timePart = ''] = schedule.split('·').map((part) => part.trim());
    const scheduleDays = this.parseDays(daysPart);
    const [startTime, endTime] = this.parseTimes(timePart);

    return { scheduleDays, startTime, endTime };
  }

  private parseDays(daysPart: string): string[] {
    const dayMap: Record<string, string> = {
      lun: 'mon',
      mar: 'tue',
      mie: 'wed',
      mié: 'wed',
      jue: 'thu',
      vie: 'fri',
      sab: 'sat',
      sáb: 'sat',
      dom: 'sun',
    };
    const order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const days: string[] = [];
    const tokens = daysPart.split(',').map((token) => token.trim()).filter(Boolean);

    for (const token of tokens) {
      const rangeMatch = token.match(/([A-Za-zÁÉÍÓÚáéíóúñÑ]{3})\s*[-–]\s*([A-Za-zÁÉÍÓÚáéíóúñÑ]{3})/);

      if (rangeMatch) {
        const start = dayMap[rangeMatch[1].toLowerCase()];
        const end = dayMap[rangeMatch[2].toLowerCase()];
        const startIndex = order.indexOf(start);
        const endIndex = order.indexOf(end);

        if (startIndex >= 0 && endIndex >= startIndex) {
          for (let index = startIndex; index <= endIndex; index += 1) {
            if (!days.includes(order[index])) days.push(order[index]);
          }
        }

        continue;
      }

      const day = dayMap[token.toLowerCase().slice(0, 3)];
      if (day && !days.includes(day)) days.push(day);
    }

    return days;
  }

  private parseTimes(timePart: string): [string, string] {
    const matches = [...timePart.matchAll(/(\d{1,2}:\d{2})\s*(AM|PM)?/gi)];
    const startTime = matches[0] ? this.to24Hour(matches[0][1], matches[0][2]) : '08:00';
    const endTime = matches[1] ? this.to24Hour(matches[1][1], matches[1][2]) : '16:00';

    return [startTime, endTime];
  }

  private to24Hour(time: string, period?: string): string {
    const [hours, minutes] = time.split(':');
    let hour = Number(hours);
    const normalizedPeriod = period?.toUpperCase();

    if (normalizedPeriod === 'PM' && hour < 12) hour += 12;
    if (normalizedPeriod === 'AM' && hour === 12) hour = 0;

    return `${String(hour).padStart(2, '0')}:${minutes}`;
  }

  private formatSchedule(scheduleDays: string[], startTime: string, endTime: string): string {
    const labels: Record<string, string> = {
      mon: 'Lun',
      tue: 'Mar',
      wed: 'Mié',
      thu: 'Jue',
      fri: 'Vie',
      sat: 'Sáb',
      sun: 'Dom',
    };
    const order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const sortedDays = [...scheduleDays].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const days = sortedDays.map((day) => labels[day] ?? day).join(', ');

    return `${days} · ${this.to12Hour(startTime)} - ${this.to12Hour(endTime)}`;
  }

  private to12Hour(time: string): string {
    const [hours, minutes] = time.split(':');
    let hour = Number(hours);
    const period = hour >= 12 ? 'PM' : 'AM';

    if (hour === 0) hour = 12;
    if (hour > 12) hour -= 12;

    return `${String(hour).padStart(2, '0')}:${minutes} ${period}`;
  }

  private toDatabaseStatus(status: string): string {
    return status.toLowerCase() === 'active' || status.toUpperCase() === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO';
  }

  private toFrontendStatus(status: string): 'active' | 'inactive' {
    return status === 'ACTIVO' ? 'active' : 'inactive';
  }

  private toResponse(employee: Prisma.EmployeeGetPayload<Record<string, never>>): EmployeeResponse {
    return {
      id: employee.id,
      employeeId: employee.identification,
      fullName: employee.name,
      role: employee.position,
      schedule: this.formatSchedule(employee.scheduleDays, employee.startTime, employee.endTime),
      salary: employee.salary,
      photoUrl: employee.photoUrl ?? '',
      email: employee.email,
      phone: employee.phone,
      status: this.toFrontendStatus(employee.status),
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    };
  }

  private handlePrismaError(error: unknown): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const fields = Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : 'unique field';
      throw new ConflictException(`Employee already exists with the same ${fields}`);
    }
  }
}
