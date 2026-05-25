import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateGymDto, UpdateGymDto, GymResponseDto } from './dtos/gym.dto';

@Injectable()
export class GymsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGymDto): Promise<GymResponseDto> {
    const gym = await this.prisma.gym.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        logoUrl: dto.logoUrl,
      },
    });
    return { success: true, data: gym };
  }

  async findAll(): Promise<GymResponseDto> {
    const gyms = await this.prisma.gym.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: gyms };
  }

  async findOne(id: string): Promise<GymResponseDto> {
    const gym = await this.prisma.gym.findUnique({
      where: { id },
    });
    if (!gym) {
      throw new NotFoundException(`Gym with ID ${id} not found`);
    }
    return { success: true, data: gym };
  }

  async findBySlug(slug: string): Promise<GymResponseDto> {
    const gym = await this.prisma.gym.findUnique({
      where: { slug },
    });
    if (!gym) {
      throw new NotFoundException(`Gym with slug ${slug} not found`);
    }
    return { success: true, data: gym };
  }

  async update(id: string, dto: UpdateGymDto): Promise<GymResponseDto> {
    const gym = await this.prisma.gym.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        logoUrl: dto.logoUrl,
        isActive: dto.isActive,
      },
    });
    return { success: true, data: gym };
  }

  async delete(id: string): Promise<{ success: boolean; data?: { message: string } }> {
    await this.prisma.gym.delete({ where: { id } });
    return { success: true, data: { message: 'Gym deleted successfully' } };
  }
}
