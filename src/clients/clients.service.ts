import { Injectable, NotFoundException } from '@nestjs/common';
import { GymDataService, CreateMemberInput, UpdateMemberInput } from '@/shared/gym-data.service';
import { CreateClientDto, UpdateClientDto, ClientResponseDto } from './dtos/client.dto';

@Injectable()
export class ClientsService {
  constructor(private gymData: GymDataService) {}

  async create(createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    return this.gymData.createMember(createClientDto as CreateMemberInput);
  }

  async findAll(query: { page?: number; limit?: number; search?: string; status?: string; riskLevel?: string } = {}) {
    return this.gymData.listMembers(query);
  }

  async findOne(id: string): Promise<ClientResponseDto> {
    const client = await this.gymData.getMember(id);

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    const client = await this.gymData.updateMember(id, updateClientDto as UpdateMemberInput);

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async delete(id: string): Promise<{ message: string }> {
    const deleted = await this.gymData.deleteMember(id);

    if (!deleted) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return { message: 'Miembro eliminado correctamente' };
  }

  async recordCheckIn(id: string, payload: { duration?: number; activities?: string[]; note?: string; attendedAt?: string }) {
    const attendance = await this.gymData.recordCheckIn(id, payload);

    if (!attendance) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return attendance;
  }

  async exportCsv(): Promise<string> {
    return await this.gymData.exportMembersCsv();
  }
}
