import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateAttendanceDto, AttendanceResponseDto } from './dtos/attendance.dto';
import { Attendance } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(
    createAttendanceDto: CreateAttendanceDto,
  ): Promise<AttendanceResponseDto> {
    // Verify client exists
    const client = await this.prisma.client.findUnique({
      where: { id: createAttendanceDto.clientId },
    });

    if (!client) {
      throw new NotFoundException(
        `Client with ID ${createAttendanceDto.clientId} not found`,
      );
    }

    // Create attendance record
    const attendance = await this.prisma.attendance.create({
      data: {
        clientId: createAttendanceDto.clientId,
        attendedAt: createAttendanceDto.attendedAt || new Date(),
      },
    });

    // Update client's lastAttendance
    await this.prisma.client.update({
      where: { id: createAttendanceDto.clientId },
      data: { lastAttendance: attendance.attendedAt },
    });

    return this.mapToResponseDto(attendance);
  }

  async findByClientId(clientId: number): Promise<AttendanceResponseDto[]> {
    // Verify client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    const attendances = await this.prisma.attendance.findMany({
      where: { clientId },
      orderBy: { attendedAt: 'desc' },
    });

    return attendances.map((attendance) => this.mapToResponseDto(attendance));
  }

  async findAll(): Promise<AttendanceResponseDto[]> {
    const attendances = await this.prisma.attendance.findMany({
      orderBy: { attendedAt: 'desc' },
    });

    return attendances.map((attendance) => this.mapToResponseDto(attendance));
  }

  private mapToResponseDto(attendance: Attendance): AttendanceResponseDto {
    return {
      id: attendance.id,
      clientId: attendance.clientId,
      attendedAt: attendance.attendedAt,
      createdAt: attendance.createdAt,
      updatedAt: attendance.updatedAt,
    };
  }
}
