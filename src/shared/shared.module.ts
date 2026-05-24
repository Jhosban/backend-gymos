import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { GymDataService } from './gym-data.service';
import { AppConfigService } from '@/config/app.config';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [GymDataService, AppConfigService],
  exports: [GymDataService, AppConfigService],
})
export class SharedModule {}