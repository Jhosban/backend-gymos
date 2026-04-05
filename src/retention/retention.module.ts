import { Module } from '@nestjs/common';
import { RetentionService } from './retention.service';
import { RetentionController } from './retention.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { AppConfigService } from '@/config/app.config';

@Module({
  imports: [PrismaModule],
  controllers: [RetentionController],
  providers: [RetentionService, AppConfigService],
  exports: [RetentionService],
})
export class RetentionModule {}
