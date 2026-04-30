import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get apiPrefix(): string {
    return this.configService.get<string>('API_PREFIX', 'v1');
  }

  get jwtSecret(): string {
    return this.configService.get<string>(
      'JWT_SECRET',
      'your-super-secret-jwt-key',
    );
  }

  get jwtExpiration(): number {
    return this.configService.get<number>('JWT_EXPIRATION', 3600);
  }

  get retentionAtRiskDays(): number {
    return this.configService.get<number>('RETENTION_AT_RISK_DAYS', 4);
  }

  get retentionInactiveDays(): number {
    return this.configService.get<number>('RETENTION_INACTIVE_DAYS', 15);
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
}
