import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RetentionService } from './retention.service';
import {
  RetentionStatusResponseDto,
  RecalculateRetentionResponseDto,
  ClientStatusDto,
} from './dtos/retention.dto';

@Controller('retention')
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
}
