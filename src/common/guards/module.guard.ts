import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  SetMetadata,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GymModulesService } from '@/gym-modules/gym-modules.service';

export const MODULE_KEY = 'requiredModule';

export const RequireModule = (key: string) => SetMetadata(MODULE_KEY, key);

@Injectable()
export class ModuleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(forwardRef(() => GymModulesService))
    private gymModulesService: GymModulesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const moduleKey = this.reflector.get<string>(MODULE_KEY, handler);

    if (!moduleKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const gymId = request.user?.gymId;

    if (!gymId) {
      throw new ForbiddenException('No gym context found');
    }

    const hasAccess = await this.gymModulesService.hasModuleAccess(gymId, moduleKey);

    if (!hasAccess) {
      throw new ForbiddenException(`Module '${moduleKey}' not active for this gym`);
    }

    return true;
  }
}
