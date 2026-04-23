import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { AttendanceModule } from './attendance/attendance.module';
import { RetentionModule } from './retention/retention.module';
import { AppConfigService } from './config/app.config';
import { SharedModule } from './shared/shared.module';
import { LeadsModule } from './leads/leads.module';
import { EquipmentModule } from './equipment/equipment.module';
import { AlertsModule } from './alerts/alerts.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SharedModule,
    AuthModule,
    ClientsModule,
    AttendanceModule,
    RetentionModule,
    LeadsModule,
    EquipmentModule,
    AlertsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppConfigService],
})
export class AppModule {}
