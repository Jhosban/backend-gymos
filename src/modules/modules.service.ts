import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ModuleResponseDto } from './dtos/module.dto';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<ModuleResponseDto> {
    const modules = await this.prisma.module.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return { success: true, data: modules };
  }

  async findOne(id: string): Promise<ModuleResponseDto> {
    const module = await this.prisma.module.findUnique({
      where: { id },
    });
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return { success: true, data: module };
  }

  async findByKey(key: string): Promise<ModuleResponseDto> {
    const module = await this.prisma.module.findUnique({
      where: { key },
    });
    if (!module) {
      throw new NotFoundException(`Module with key ${key} not found`);
    }
    return { success: true, data: module };
  }
}
