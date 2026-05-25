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
  gymId?: string;
  employeeId?: string;
  fullName?: string;
  role?: string;
  schedule?: string | null;
  salary?: number;
  photoUrl?: string | null;
  email?: string | null;
  phone?: string | null;
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
    const data = {
      ...(await this.normalizeInput(dto, true)),
      gym: {
        connect: {
          id: await this.getDefaultGymId(),
        },
      },
    } as Prisma.EmployeeCreateInput;

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

  private async getDefaultGymId(): Promise<string> {
    const gym = await this.prisma.gym.findFirst();

    if (!gym) {
      throw new ConflictException('No gym found to assign employee');
    }

    return gym.id;
  }

  private normalizeInput(dto: CreateEmployeeDto | UpdateEmployeeDto, requireRequiredFields: boolean): NormalizedEmployeeInput {
    const employeeId = dto.identification ?? dto.employeeId;
    const fullName = dto.name ?? dto.fullName;
    const role = dto.position ?? dto.role;
    const status = dto.status ? this.toDatabaseStatus(dto.status) : requireRequiredFields ? 'active' : undefined;

    if (requireRequiredFields) {
      const missingFields: string[] = [];
      if (!employeeId) missingFields.push('employeeId');
      if (!fullName) missingFields.push('fullName');
      if (!role) missingFields.push('role');
      if (!dto.schedule) missingFields.push('schedule');
      if (dto.salary === undefined || dto.salary === null) missingFields.push('salary');
      if (!dto.email) missingFields.push('email');
      if (!dto.phone) missingFields.push('phone');

      if (missingFields.length > 0) {
        throw new ConflictException(`Missing required fields: ${missingFields.join(', ')}`);
      }
    }

    const data: NormalizedEmployeeInput = {};
    if (employeeId !== undefined) data.employeeId = employeeId;
    if (fullName !== undefined) data.fullName = fullName;
    if (role !== undefined) data.role = role;
    if (dto.schedule !== undefined) data.schedule = dto.schedule;
    if (dto.salary !== undefined) data.salary = dto.salary;
    if (dto.photoUrl !== undefined) data.photoUrl = dto.photoUrl || null;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (status !== undefined) data.status = status;

    return data;
  }

  private toDatabaseStatus(status: string): string {
    return status.toLowerCase() === 'active' || status.toUpperCase() === 'ACTIVO' ? 'active' : 'inactive';
  }

  private toFrontendStatus(status: string): 'active' | 'inactive' {
    return status.toLowerCase() === 'active' ? 'active' : 'inactive';
  }

  private toResponse(employee: Prisma.EmployeeGetPayload<Record<string, never>>): EmployeeResponse {
    return {
      id: employee.id,
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      role: employee.role,
      schedule: employee.schedule ?? '',
      salary: employee.salary ?? 0,
      photoUrl: employee.photoUrl ?? '',
      email: employee.email ?? '',
      phone: employee.phone ?? '',
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
