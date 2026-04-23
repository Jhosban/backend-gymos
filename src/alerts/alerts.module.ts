import { Module } from '@nestjs/common';
import { SharedModule } from '@/shared/shared.module';
import { AlertsController } from './alerts.controller';

@Module({
  imports: [SharedModule],
  controllers: [AlertsController],
})
export class AlertsModule {}
