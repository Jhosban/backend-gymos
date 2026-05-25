import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { GymModulesService } from './gym-modules.service';
import { GymModuleResponseDto } from './dtos/gym-module.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentGym } from '@/common/decorators/current-gym.decorator';

@Controller('gym-modules')
@UseGuards(JwtAuthGuard)
export class GymModulesController {
  constructor(private gymModulesService: GymModulesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllForGym(@CurrentGym() gymId: string): Promise<GymModuleResponseDto> {
    return this.gymModulesService.findAllForGym(gymId);
  }

  @Post(':moduleKey/activate')
  @HttpCode(HttpStatus.OK)
  async activateModule(
    @CurrentGym() gymId: string,
    @Param('moduleKey') moduleKey: string,
  ): Promise<GymModuleResponseDto> {
    return this.gymModulesService.activateModule(gymId, moduleKey);
  }

  @Delete(':moduleKey/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivateModule(
    @CurrentGym() gymId: string,
    @Param('moduleKey') moduleKey: string,
  ): Promise<GymModuleResponseDto> {
    return this.gymModulesService.deactivateModule(gymId, moduleKey);
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  async getActiveModules(@CurrentGym() gymId: string): Promise<{ success: boolean; data: string[] }> {
    const activeModules = await this.gymModulesService.getActiveModules(gymId);
    return { success: true, data: activeModules };
  }
}
