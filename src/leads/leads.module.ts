import { Module } from '@nestjs/common';
import { SharedModule } from '@/shared/shared.module';
import { ExcelModule } from '@/excel/excel.module';
import { LeadsController } from './leads.controller';

@Module({
  imports: [SharedModule, ExcelModule],
  controllers: [LeadsController],
})
export class LeadsModule {}
