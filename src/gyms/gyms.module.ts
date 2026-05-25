import { Module } from '@nestjs/common';
import { SharedModule } from '@/shared/shared.module';
import { GymsController } from './gyms.controller';
import { GymsService } from './gyms.service';

@Module({
  imports: [SharedModule],
  controllers: [GymsController],
  providers: [GymsService],
  exports: [GymsService],
})
export class GymsModule {}
