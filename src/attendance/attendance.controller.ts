import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto, AttendanceResponseDto } from './dtos/attendance.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ModuleGuard, RequireModule } from '@/common/guards/module.guard';
import { CurrentGymId } from '@/common/decorators/current-user.decorator';

@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('checkin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @CurrentGymId() gymId: string,
  ): Promise<AttendanceResponseDto> {
    return this.attendanceService.create(createAttendanceDto, gymId);
  }

  @Get('client/:clientId')
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('checkin')
  @HttpCode(HttpStatus.OK)
  async findByClientId(
    @Param('clientId') clientId: string,
    @CurrentGymId() gymId: string,
  ): Promise<AttendanceResponseDto[]> {
    return this.attendanceService.findByClientId(clientId, gymId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('checkin')
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentGymId() gymId: string): Promise<AttendanceResponseDto[]> {
    return this.attendanceService.findAll(gymId);
  }

  @Post('qr-checkin')
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('checkin')
  @HttpCode(HttpStatus.CREATED)
  async qrCheckIn(@Body() body: any, @CurrentGymId() gymId: string) {
    return this.attendanceService.qrCheckIn(body, gymId);
  }

  @Post('biometric/register')
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('checkin')
  @HttpCode(HttpStatus.OK)
  async registerBiometric(@Body() body: any, @CurrentGymId() gymId: string) {
    return this.attendanceService.registerBiometric(body, gymId);
  }

  @Get('biometric/members')
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('checkin')
  @HttpCode(HttpStatus.OK)
  async listBiometricMembers(@CurrentGymId() gymId: string) {
    return this.attendanceService.listBiometricMembers(gymId);
  }

  @Get('biometric/member/:memberId')
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('checkin')
  @HttpCode(HttpStatus.OK)
  async getMemberBiometricStatus(
    @Param('memberId') memberId: string,
    @CurrentGymId() gymId: string,
  ) {
    return this.attendanceService.getMemberBiometricStatus(memberId, gymId);
  }

  @Post('biometric-checkin')
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('checkin')
  @HttpCode(HttpStatus.CREATED)
  async biometricCheckin(@Body() body: any, @CurrentGymId() gymId: string) {
    return this.attendanceService.biometricCheckin(body, gymId);
  }
}
