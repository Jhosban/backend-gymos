import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateClientDto, UpdateClientDto, ClientResponseDto } from './dtos/client.dto';
import { Client } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    const client = await this.prisma.client.create({
      data: {
        name: createClientDto.name,
        email: createClientDto.email,
        phone: createClientDto.phone,
        status: 'ACTIVE',
      },
    });

    return this.mapToResponseDto(client);
  }

  async findAll(): Promise<ClientResponseDto[]> {
    const clients = await this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return clients.map((client) => this.mapToResponseDto(client));
  }

  async findOne(id: number): Promise<ClientResponseDto> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return this.mapToResponseDto(client);
  }

  async update(
    id: number,
    updateClientDto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    const client = await this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });

    return this.mapToResponseDto(client);
  }

  async delete(id: number): Promise<{ message: string }> {
    await this.prisma.client.delete({
      where: { id },
    });

    return { message: `Client with ID ${id} deleted successfully` };
  }

  async findByEmail(email: string): Promise<Client | null> {
    return this.prisma.client.findUnique({
      where: { email },
    });
  }

  private mapToResponseDto(client: Client): ClientResponseDto {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      status: client.status,
      lastAttendance: client.lastAttendance,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
