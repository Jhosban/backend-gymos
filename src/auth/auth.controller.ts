import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, AuthResponseDto } from './dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto): Promise<AuthResponseDto> {
    const data = await this.authService.signup(signupDto);
    return { success: true, data } as any;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const data = await this.authService.login(loginDto);
    return { success: true, data } as any;
  }
}
