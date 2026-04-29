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

@Controller('members')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    const data = await this.clientsService.create(createClientDto);
    return { success: true, data } as any;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: { page?: number; limit?: number; search?: string; status?: string; riskLevel?: string }) {
    const data = await this.clientsService.findAll(query);
    return { success: true, data };
  }

  @Get('export/csv')
  @Header('Content-Type', 'text/csv')
  async exportCsv() {
    return this.clientsService.exportCsv();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<ClientResponseDto> {
    const data = await this.clientsService.findOne(id);
    return { success: true, data } as any;
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    const data = await this.clientsService.update(id, updateClientDto);
    return { success: true, data } as any;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    const data = await this.clientsService.delete(id);
    return { success: true, data } as any;
  }

  @Post(':id/checkin')
  @HttpCode(HttpStatus.CREATED)
  async recordCheckIn(
    @Param('id') id: string,
    @Body() body: { duration?: number; activities?: string[]; note?: string; attendedAt?: string },
  ) {
    const data = await this.clientsService.recordCheckIn(id, body);
    return { success: true, data } as any;
  }
}
