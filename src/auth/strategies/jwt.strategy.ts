import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: process.env.NODE_ENV !== 'production',
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-super-secret-jwt-key'),
    });
  }

  async validate(payload: any) {
    // Ensure sub is always treated as a string for consistency
    const userId = typeof payload.sub === 'number' ? String(payload.sub) : payload.sub;
    return this.authService.validateUser(userId);
  }
}
