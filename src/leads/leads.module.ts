import { Module } from '@nestjs/common';
import { SharedModule } from '@/shared/shared.module';
import { LeadsController } from './leads.controller';

@Module({
  imports: [SharedModule],
  controllers: [LeadsController],
})
export class LeadsModule {}
