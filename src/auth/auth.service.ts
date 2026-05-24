import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupDto, LoginDto, AuthResponseDto } from './dtos/auth.dto';
import * as bcrypt from 'bcryptjs';
import { AppConfigService } from '@/config/app.config';
import { GymDataService } from '@/shared/gym-data.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private appConfig: AppConfigService,
    private gymData: GymDataService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const { email, name, password } = signupDto;

    // Validate name
    if (!name || name.trim().length < 3) {
      throw new BadRequestException('El nombre debe tener al menos 3 caracteres');
    }

    // Validate password length
    if (!password || password.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }

    // Check if user already exists
    const existingUser = await this.gymData.findUserByEmail(email);

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const user = await this.gymData.createUser(email, name, password, 'user');

    // Generate JWT token
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: this.appConfig.jwtExpiration },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.gymData.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email o contraseña inválidos');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email o contraseña inválidos');
    }

    // Generate JWT token
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: this.appConfig.jwtExpiration },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.gymData.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
