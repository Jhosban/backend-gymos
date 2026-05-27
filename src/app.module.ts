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
import { EmployeesModule } from './employees/employees.module';
import { GymsModule } from './gyms/gyms.module';
import { ModulesModule } from './modules/modules.module';
import { GymModulesModule } from './gym-modules/gym-modules.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ModuleGuard } from './common/guards/module.guard';

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
    EmployeesModule,
    GymsModule,
    ModulesModule,
    GymModulesModule,
    PromotionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppConfigService, ModuleGuard],
})
export class AppModule {}
