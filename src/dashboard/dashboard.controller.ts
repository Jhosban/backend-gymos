import { Controller, Get, UseGuards } from '@nestjs/common';
import { GymDataService } from '@/shared/gym-data.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly gymData: GymDataService) {}

  @Get('metrics')
  async metrics() {
    return { success: true, data: await this.gymData.getDashboardMetrics() };
  }

  @Get('churn-distribution')
  async churnDistribution() {
    return { success: true, data: await this.gymData.getChurnDistribution() };
  }

  @Get('pipeline-data')
  async pipelineData() {
    return { success: true, data: await this.gymData.getPipelineData() };
  }

  @Get('membership-types')
  async membershipTypes() {
    return { success: true, data: await this.gymData.getMembershipTypes() };
  }
}