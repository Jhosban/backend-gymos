import { Module } from '@nestjs/common';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { SharedModule } from '@/shared/shared.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [SharedModule, PrismaModule],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}