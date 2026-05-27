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

@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('checkin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAttendanceDto: CreateAttendanceDto,
  ): Promise<AttendanceResponseDto> {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get('client/:clientId')
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('checkin')
  @HttpCode(HttpStatus.OK)
  async findByClientId(
    @Param('clientId') clientId: string,
  ): Promise<AttendanceResponseDto[]> {
    return this.attendanceService.findByClientId(clientId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('checkin')
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<AttendanceResponseDto[]> {
    return this.attendanceService.findAll();
  }

  @Post('qr-checkin')
  @HttpCode(HttpStatus.CREATED)
  async qrCheckIn(@Body() body: any) {
    return this.attendanceService.qrCheckIn(body);
  }

  @Post('biometric/register')
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('checkin')
  @HttpCode(HttpStatus.OK)
  async registerBiometric(@Body() body: any) {
    return this.attendanceService.registerBiometric(body);
  }

  @Get('biometric/members')
  @HttpCode(HttpStatus.OK)
  async listBiometricMembers() {
    return this.attendanceService.listBiometricMembers();
  }

  @Get('biometric/member/:memberId')
  @UseGuards(JwtAuthGuard, ModuleGuard)
  @RequireModule('checkin')
  @HttpCode(HttpStatus.OK)
  async getMemberBiometricStatus(@Param('memberId') memberId: string) {
    return this.attendanceService.getMemberBiometricStatus(memberId);
  }

  @Post('biometric-checkin')
  @HttpCode(HttpStatus.CREATED)
  async biometricCheckin(@Body() body: any) {
    return this.attendanceService.biometricCheckin(body);
  }
}
