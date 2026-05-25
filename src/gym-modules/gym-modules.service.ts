import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { GymModuleResponseDto } from './dtos/gym-module.dto';

@Injectable()
export class GymModulesService {
  constructor(private prisma: PrismaService) {}

  async findAllForGym(gymId: string): Promise<GymModuleResponseDto> {
    const gymModules = await this.prisma.gymModule.findMany({
      where: { gymId },
      include: { module: true },
      orderBy: { module: { name: 'asc' } },
    });
    return { success: true, data: gymModules };
  }

  async activateModule(gymId: string, moduleKey: string): Promise<GymModuleResponseDto> {
    const module = await this.prisma.module.findUnique({
      where: { key: moduleKey },
    });

    if (!module) {
      throw new NotFoundException(`Module with key ${moduleKey} not found`);
    }

    const existing = await this.prisma.gymModule.findUnique({
      where: { gymId_moduleId: { gymId, moduleId: module.id } },
    });

    if (existing) {
      const updated = await this.prisma.gymModule.update({
        where: { id: existing.id },
        data: {
          status: 'ACTIVE',
          activatedAt: new Date(),
          trialEndsAt: null,
        },
        include: { module: true },
      });
      return { success: true, data: updated };
    }

    const created = await this.prisma.gymModule.create({
      data: {
        gymId,
        moduleId: module.id,
        status: 'ACTIVE',
        activatedAt: new Date(),
      },
      include: { module: true },
    });
    return { success: true, data: created };
  }

  async deactivateModule(gymId: string, moduleKey: string): Promise<GymModuleResponseDto> {
    const module = await this.prisma.module.findUnique({
      where: { key: moduleKey },
    });

    if (!module) {
      throw new NotFoundException(`Module with key ${moduleKey} not found`);
    }

    const gymModule = await this.prisma.gymModule.findUnique({
      where: { gymId_moduleId: { gymId, moduleId: module.id } },
    });

    if (!gymModule) {
      throw new NotFoundException(`Module ${moduleKey} not assigned to this gym`);
    }

    const updated = await this.prisma.gymModule.update({
      where: { id: gymModule.id },
      data: { status: 'EXPIRED' },
      include: { module: true },
    });
    return { success: true, data: updated };
  }

  async hasModuleAccess(gymId: string, moduleKey: string): Promise<boolean> {
    const module = await this.prisma.module.findUnique({
      where: { key: moduleKey },
    });

    if (!module) return false;

    const gymModule = await this.prisma.gymModule.findUnique({
      where: { gymId_moduleId: { gymId, moduleId: module.id } },
    });

    if (!gymModule) return false;

    if (gymModule.status === 'ACTIVE') return true;

    if (gymModule.status === 'TRIAL' && gymModule.trialEndsAt) {
      return new Date(gymModule.trialEndsAt) > new Date();
    }

    return false;
  }

  async getActiveModules(gymId: string): Promise<string[]> {
    const modules = await this.prisma.gymModule.findMany({
      where: {
        gymId,
        OR: [
          { status: 'ACTIVE' },
          { 
            status: 'TRIAL',
            trialEndsAt: { gt: new Date() },
          },
        ],
      },
      include: { module: true },
    });
    return modules.map((m) => m.module.key);
  }

  async createTrialModules(gymId: string): Promise<void> {
    const allModules = await this.prisma.module.findMany({
      where: { isActive: true },
    });

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    for (const module of allModules) {
      await this.prisma.gymModule.upsert({
        where: { gymId_moduleId: { gymId, moduleId: module.id } },
        update: {},
        create: {
          gymId,
          moduleId: module.id,
          status: 'TRIAL',
          trialEndsAt: trialEndDate,
        },
      });
    }
  }
}
