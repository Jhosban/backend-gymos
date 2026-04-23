import { Injectable } from '@nestjs/common';
import { GymDataService } from '@/shared/gym-data.service';

@Injectable()
export class AppService {
  constructor(private readonly gymData: GymDataService) {}

  getHello(): string {
    return 'Welcome to GymOS Backend API! 🏋️';
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }

  async getDatabaseHealth(): Promise<{
    status: string;
    timestamp: string;
    database: string;
    metrics: Awaited<ReturnType<GymDataService['getDashboardMetrics']>>;
  }> {
    const metrics = await this.gymData.getDashboardMetrics();

    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected',
      metrics,
    };
  }
}
