import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { GymDataService } from './gym-data.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [GymDataService],
  exports: [GymDataService],
})
export class SharedModule {}