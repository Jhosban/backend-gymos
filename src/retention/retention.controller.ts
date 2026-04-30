import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RetentionService } from './retention.service';
import {
  RetentionStatusResponseDto,
  RecalculateRetentionResponseDto,
  ClientStatusDto,
} from './dtos/retention.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('retention')
@UseGuards(JwtAuthGuard)
export class RetentionController {
  constructor(private retentionService: RetentionService) {}

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(): Promise<RetentionStatusResponseDto> {
    return this.retentionService.getStatus();
  }

  @Post('recalculate')
  @HttpCode(HttpStatus.OK)
  async recalculateStatus(): Promise<RecalculateRetentionResponseDto> {
    return this.retentionService.recalculateStatus();
  }

  @Get('at-risk')
  @HttpCode(HttpStatus.OK)
  async getAtRiskClients(): Promise<ClientStatusDto[]> {
    return this.retentionService.getAtRiskClients();
  }

  @Get('high-risk')
  @HttpCode(HttpStatus.OK)
  async getHighRiskClients(): Promise<ClientStatusDto[]> {
    return this.retentionService.getHighRiskClients();
  }
}
