import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  Header,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto, ClientResponseDto } from './dtos/client.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ModuleGuard, RequireModule } from '@/common/guards/module.guard';
import { CurrentGymId } from '@/common/decorators/current-user.decorator';

@Controller('members')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('members')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createClientDto: CreateClientDto,
    @CurrentGymId() gymId: string,
  ): Promise<ClientResponseDto> {
    const data = await this.clientsService.create(createClientDto, gymId);
    return { success: true, data } as any;
  }

  @Get('checkin-options')
  @HttpCode(HttpStatus.OK)
  async listCheckInMembers() {
    const data = await this.clientsService.listCheckInMembers();
    return { success: true, data };
  }

  @Get()
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('members')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query()
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      riskLevel?: string;
    },
    @CurrentGymId() gymId: string,
  ) {
    const data = await this.clientsService.findAll(query, gymId);
    return { success: true, data };
  }

  @Get('export/csv')
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('members')
  @Header('Content-Type', 'text/csv')
  async exportCsv(@CurrentGymId() gymId: string) {
    return this.clientsService.exportCsv(gymId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('members')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
    @CurrentGymId() gymId: string,
  ): Promise<ClientResponseDto> {
    const data = await this.clientsService.findOne(id, gymId);
    return { success: true, data } as any;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('members')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
    @CurrentGymId() gymId: string,
  ): Promise<ClientResponseDto> {
    const data = await this.clientsService.update(id, updateClientDto, gymId);
    return { success: true, data } as any;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('members')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @CurrentGymId() gymId: string,
  ): Promise<{ message: string }> {
    const data = await this.clientsService.delete(id, gymId);
    return { success: true, data } as any;
  }

  @Post(':id/checkin')
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('members')
  @HttpCode(HttpStatus.CREATED)
  async recordCheckIn(
    @Param('id') id: string,
    @Body()
    body: {
      duration?: number;
      activities?: string[];
      note?: string;
      attendedAt?: string;
    },
    @CurrentGymId() gymId: string,
  ) {
    const data = await this.clientsService.recordCheckIn(id, body, gymId);
    return { success: true, data } as any;
  }
}
