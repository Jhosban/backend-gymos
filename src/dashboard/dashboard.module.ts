import { Module } from '@nestjs/common';
import { SharedModule } from '@/shared/shared.module';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [SharedModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
