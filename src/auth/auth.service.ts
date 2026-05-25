import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupDto, LoginDto, ChangePasswordDto, AuthResponseDto } from './dtos/auth.dto';
import * as bcrypt from 'bcryptjs';
import { AppConfigService } from '@/config/app.config';
import { GymDataService } from '@/shared/gym-data.service';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private appConfig: AppConfigService,
    private gymData: GymDataService,
    private prisma: PrismaService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const { email, name, password, plan } = signupDto;

    // Validate name
    if (!name || name.trim().length < 3) {
      throw new BadRequestException('El nombre debe tener al menos 3 caracteres');
    }

    // Validate password length
    if (!password || password.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }

    // Validate plan
    const validPlans = ['BASIC', 'PRO', 'CUSTOM'];
    const selectedPlan = plan && validPlans.includes(plan.toUpperCase()) ? plan.toUpperCase() : 'BASIC';

    // Check if user already exists
    const existingUser = await this.gymData.findUserByEmail(email);

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Create gym for the new user with the selected plan
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36);
    const gym = await this.prisma.gym.create({
      data: {
        name: name + "'s Gym",
        slug,
        email,
        plan: selectedPlan,
      },
    });

    // Create user with gym reference
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: bcrypt.hashSync(password, 10),
        role: 'ADMIN',
        gymId: gym.id,
      },
    });

    // Determine which modules to create based on plan
    const allModules = await this.prisma.module.findMany({ where: { isActive: true } });
    const moduleKeys = allModules.map(m => m.key);

    let modulesToCreate: string[];

    if (selectedPlan === 'PRO') {
      // Pro: all modules
      modulesToCreate = moduleKeys;
    } else if (selectedPlan === 'BASIC') {
      // Basic: only members
      modulesToCreate = ['members'];
    } else {
      // Custom: members only (others can be activated from /modules)
      modulesToCreate = ['members'];
    }

    // Create trial modules for the gym (14 days)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    for (const module of allModules) {
      if (modulesToCreate.includes(module.key)) {
        await this.prisma.gymModule.create({
          data: {
            gymId: gym.id,
            moduleId: module.id,
            status: 'TRIAL',
            trialEndsAt: trialEndDate,
          },
        });
      }
    }

    // Generate JWT token with gymId
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role, gymId: user.gymId },
      { expiresIn: this.appConfig.jwtExpiration },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase() as 'admin' | 'user' | 'trainer' | 'advisor',
        gymId: user.gymId,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email with gym relation
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { gym: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email o contraseña inválidos');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email o contraseña inválidos');
    }

    // Generate JWT token with gymId
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role, gymId: user.gymId },
      { expiresIn: this.appConfig.jwtExpiration },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase() as 'admin' | 'user' | 'trainer' | 'advisor',
        gymId: user.gymId,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { gym: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase(),
      gymId: user.gymId,
    };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = dto;

    if (newPassword === currentPassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser distinta de la actual',
      );
    }

    const user = await this.gymData.findUserById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    await this.gymData.updateUserPassword(userId, newPassword);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
