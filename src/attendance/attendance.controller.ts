import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto, AttendanceResponseDto } from './dtos/attendance.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAttendanceDto: CreateAttendanceDto,
  ): Promise<AttendanceResponseDto> {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get('client/:clientId')
  @HttpCode(HttpStatus.OK)
  async findByClientId(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<AttendanceResponseDto[]> {
    return this.attendanceService.findByClientId(clientId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<AttendanceResponseDto[]> {
    return this.attendanceService.findAll();
  }
}
