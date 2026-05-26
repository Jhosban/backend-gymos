import { Injectable, NotFoundException } from '@nestjs/common';
import { GymDataService, CreateMemberInput, UpdateMemberInput } from '@/shared/gym-data.service';
import { CreateClientDto, UpdateClientDto, ClientResponseDto } from './dtos/client.dto';

@Injectable()
export class ClientsService {
  constructor(private gymData: GymDataService) {}

  async create(createClientDto: CreateClientDto, gymId: string): Promise<ClientResponseDto> {
    return this.gymData.createMember(createClientDto as CreateMemberInput, gymId);
  }

  async findAll(query: { page?: number; limit?: number; search?: string; status?: string; riskLevel?: string; gymId?: string } = {}, gymId?: string) {
    return this.gymData.listMembers(query, gymId);
  }

  async findOne(id: string, gymId?: string): Promise<ClientResponseDto> {
    const client = await this.gymData.getMember(id, gymId);

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
    gymId?: string,
  ): Promise<ClientResponseDto> {
    const client = await this.gymData.updateMember(id, updateClientDto as UpdateMemberInput, gymId);

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async delete(id: string, gymId?: string): Promise<{ message: string }> {
    const deleted = await this.gymData.deleteMember(id, gymId);

    if (!deleted) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return { message: 'Miembro eliminado correctamente' };
  }

  async recordCheckIn(id: string, payload: { duration?: number; activities?: string[]; note?: string; attendedAt?: string }, gymId?: string) {
    const attendance = await this.gymData.recordCheckIn(id, payload, gymId);

    if (!attendance) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return attendance;
  }

  async exportCsv(gymId?: string): Promise<string> {
    return await this.gymData.exportMembersCsv(gymId);
  }
}
