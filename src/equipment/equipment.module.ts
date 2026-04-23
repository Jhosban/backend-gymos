import { Module } from '@nestjs/common';
import { SharedModule } from '@/shared/shared.module';
import { EquipmentController } from './equipment.controller';

@Module({
  imports: [SharedModule],
  controllers: [EquipmentController],
})
export class EquipmentModule {}
