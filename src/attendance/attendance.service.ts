import { Injectable, NotFoundException } from '@nestjs/common';
import { GymDataService } from '@/shared/gym-data.service';
import { CreateAttendanceDto, AttendanceResponseDto } from './dtos/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private gymData: GymDataService) {}

  async create(
    createAttendanceDto: CreateAttendanceDto,
  ): Promise<AttendanceResponseDto> {
    const attendance = await this.gymData.recordCheckIn(createAttendanceDto.clientId, {
      duration: createAttendanceDto.duration,
      activities: createAttendanceDto.activities,
      note: createAttendanceDto.note,
      attendedAt: createAttendanceDto.attendedAt,
    });

    if (!attendance) {
      throw new NotFoundException(`Client with ID ${createAttendanceDto.clientId} not found`);
    }

    return this.mapToResponseDto(createAttendanceDto.clientId, attendance);
  }

  async findByClientId(clientId: string): Promise<AttendanceResponseDto[]> {
    const client = await this.gymData.getMember(clientId);
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    return client.attendance.map((attendance) => this.mapToResponseDto(clientId, attendance));
  }

  async findAll(): Promise<AttendanceResponseDto[]> {
    const listed = await this.gymData.listMembers({ page: 1, limit: 100 });
    return listed.members.flatMap((member) =>
      member.attendance.map((attendance) => this.mapToResponseDto(member.id, attendance)),
    );
  }

  private mapToResponseDto(clientId: string, attendance: { date: string; duration?: number; activities?: string[]; note?: string }): AttendanceResponseDto {
    return {
      id: attendance.date,
      clientId,
      attendedAt: new Date(attendance.date),
      createdAt: new Date(attendance.date),
      updatedAt: new Date(attendance.date),
    };
  }
}
