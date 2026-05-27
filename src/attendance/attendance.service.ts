import { Injectable, NotFoundException } from '@nestjs/common';
import { GymDataService } from '@/shared/gym-data.service';
import { CreateAttendanceDto, AttendanceResponseDto } from './dtos/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private gymData: GymDataService) {}

  async create(
    createAttendanceDto: CreateAttendanceDto,
    gymId: string,
  ): Promise<AttendanceResponseDto> {
    const attendance = await this.gymData.recordCheckIn(
      createAttendanceDto.clientId,
      {
        duration: createAttendanceDto.duration,
        activities: createAttendanceDto.activities,
        note: createAttendanceDto.note,
        attendedAt: createAttendanceDto.attendedAt,
      },
      gymId,
    );

    if (!attendance) {
      throw new NotFoundException(
        `Client with ID ${createAttendanceDto.clientId} not found`,
      );
    }

    return this.mapToResponseDto(createAttendanceDto.clientId, attendance);
  }

  async qrCheckIn(
    payload: {
      qrData: string;
      duration?: number;
      activities?: string[];
    },
    gymId: string,
  ) {
    const { qrData, duration, activities } = payload;
    let memberId = qrData;

    try {
      const parsed = JSON.parse(qrData);
      if (parsed && typeof parsed === 'object' && parsed.memberId) {
        memberId = parsed.memberId;
      }
    } catch {
      // assume plain id
    }

    const attendance = await this.gymData.recordCheckIn(
      memberId,
      {
        duration,
        activities,
      },
      gymId,
    );
    if (!attendance) throw new NotFoundException(`Member ${memberId} not found`);
    return { success: true, data: attendance };
  }

  async registerBiometric(
    payload: { memberId: string; credentialId: string },
    gymId: string,
  ) {
    const { memberId, credentialId } = payload;
    const updated = await this.gymData.setMemberBiometricCredential(
      memberId,
      credentialId,
      gymId,
    );
    if (!updated) throw new NotFoundException(`Member ${memberId} not found`);
    return { success: true };
  }

  async listBiometricMembers(gymId: string) {
    const members = await this.gymData.listMembersForCheckIn(gymId);
    return { success: true, data: members };
  }

  async getMemberBiometricStatus(memberId: string, gymId: string) {
    const has = await this.gymData.hasMemberBiometricCredential(memberId, gymId);
    return { hasCredential: !!has };
  }

  async biometricCheckin(
    payload: {
      memberId?: string;
      credentialId: string;
      duration?: number;
      activities?: string[];
    },
    gymId: string,
  ) {
    const { memberId, credentialId, duration, activities } = payload;

    const resolvedMember = memberId
      ? await this.gymData.getMember(memberId, gymId)
      : await this.gymData.findMemberByBiometricCredential(credentialId, gymId);

    if (!resolvedMember) {
      throw new NotFoundException(
        memberId
          ? `Member ${memberId} not found`
          : 'No member found with the provided biometric credential',
      );
    }

    const stored = await this.gymData.getMemberBiometricCredential(
      resolvedMember.id,
      gymId,
    );
    if (!stored) {
      throw new NotFoundException(
        `Member ${resolvedMember.id} has no biometric credential`,
      );
    }

    if (stored !== credentialId) {
      return { success: false, message: 'Credential mismatch' };
    }

    const attendance = await this.gymData.recordCheckIn(
      resolvedMember.id,
      {
        duration,
        activities,
      },
      gymId,
    );
    if (!attendance)
      throw new NotFoundException(`Member ${resolvedMember.id} not found`);
    return {
      success: true,
      data: {
        memberId: resolvedMember.id,
        memberName: resolvedMember.name,
        attendance,
      },
    };
  }

  async findByClientId(
    clientId: string,
    gymId: string,
  ): Promise<AttendanceResponseDto[]> {
    const client = await this.gymData.getMember(clientId, gymId);
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    return client.attendance.map((attendance) =>
      this.mapToResponseDto(clientId, attendance),
    );
  }

  async findAll(gymId: string): Promise<AttendanceResponseDto[]> {
    const listed = await this.gymData.listMembers({ page: 1, limit: 100 }, gymId);
    return listed.members.flatMap((member) =>
      member.attendance.map((attendance) =>
        this.mapToResponseDto(member.id, attendance),
      ),
    );
  }

  private mapToResponseDto(
    clientId: string,
    attendance: {
      date: string;
      duration?: number;
      activities?: string[];
      note?: string;
    },
  ): AttendanceResponseDto {
    return {
      id: attendance.date,
      clientId,
      attendedAt: new Date(attendance.date),
      createdAt: new Date(attendance.date),
      updatedAt: new Date(attendance.date),
    };
  }
}
