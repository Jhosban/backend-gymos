import { Global, Module } from '@nestjs/common';
import { SharedModule } from '@/shared/shared.module';
import { GymModulesController } from './gym-modules.controller';
import { GymModulesService } from './gym-modules.service';

@Global()
@Module({
  imports: [SharedModule],
  controllers: [GymModulesController],
  providers: [GymModulesService],
  exports: [GymModulesService],
})
export class GymModulesModule {}
