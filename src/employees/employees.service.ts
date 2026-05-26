import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dtos/employee.dto';

let cachedGymId: string | null = null;

async function getDefaultGymId(prisma: PrismaService): Promise<string> {
  if (cachedGymId) return cachedGymId;
  const gym = await prisma.gym.findFirst();
  if (!gym) throw new Error('No gym found');
  cachedGymId = gym.id;
  return gym.id;
}

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
  employeeId?: string;
  fullName?: string;
  role?: string;
  schedule?: string;
  salary?: number;
  photoUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string;
};

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(gymId?: string): Promise<EmployeeResponse[]> {
    const where: Prisma.EmployeeWhereInput = {};
    if (gymId) {
      where.gymId = gymId;
    }
    const employees = await this.prisma.employee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return employees.map((employee) => this.toResponse(employee));
  }

  async findOne(id: string, gymId?: string): Promise<EmployeeResponse> {
    const where: Prisma.EmployeeWhereInput = { id };
    if (gymId) {
      where.gymId = gymId;
    }
    const employee = await this.prisma.employee.findFirst({ where });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return this.toResponse(employee);
  }

  async create(dto: CreateEmployeeDto, gymId?: string): Promise<EmployeeResponse> {
    const data = this.normalizeInput(dto, true) as Prisma.EmployeeCreateInput;
    const resolvedGymId = gymId ?? (await getDefaultGymId(this.prisma));

    try {
      const { updatedAt, createdAt, ...rest } = data;
      const employee = await this.prisma.employee.create({ 
        data: { 
          ...rest, 
          gym: { connect: { id: resolvedGymId } }
        } 
      });
      return this.toResponse(employee);
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateEmployeeDto, gymId?: string): Promise<EmployeeResponse> {
    await this.ensureExists(id, gymId);
    const data = this.normalizeInput(dto, false) as Prisma.EmployeeUpdateInput;

    try {
      const { updatedAt, createdAt, ...rest } = data;
      const employee = await this.prisma.employee.update({
        where: { id },
        data: rest,
      });
      return this.toResponse(employee);
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async delete(id: string, gymId?: string): Promise<{ message: string }> {
    await this.ensureExists(id, gymId);
    await this.prisma.employee.delete({ where: { id } });

    return { message: 'Empleado eliminado correctamente' };
  }

  private async ensureExists(id: string, gymId?: string) {
    const where: Prisma.EmployeeWhereInput = { id };
    if (gymId) {
      where.gymId = gymId;
    }
    const employee = await this.prisma.employee.findFirst({ where });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
  }

  private normalizeInput(dto: CreateEmployeeDto | UpdateEmployeeDto, requireRequiredFields: boolean): NormalizedEmployeeInput {
    const employeeId = dto.employeeId ?? dto.identification;
    const fullName = dto.fullName ?? dto.name;
    const role = dto.role ?? dto.position;
    const status = dto.status ? this.toDatabaseStatus(dto.status) : requireRequiredFields ? 'ACTIVO' : undefined;

    if (requireRequiredFields) {
      const missingFields: string[] = [];
      if (!employeeId) missingFields.push('employeeId');
      if (!fullName) missingFields.push('fullName');
      if (!role) missingFields.push('role');
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
