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
      throw new NotFoundException(
        `Client with ID ${createAttendanceDto.clientId} not found`,
      );
    }

    return this.mapToResponseDto(createAttendanceDto.clientId, attendance);
  }

  async qrCheckIn(payload: {
    qrData: string;
    duration?: number;
    activities?: string[];
  }) {
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

    const attendance = await this.gymData.recordCheckIn(memberId, {
      duration,
      activities,
    });
    if (!attendance) throw new NotFoundException(`Member ${memberId} not found`);
    return { success: true, data: attendance };
  }

  async registerBiometric(payload: { memberId: string; credentialId: string }) {
    const { memberId, credentialId } = payload;
    const updated = await this.gymData.setMemberBiometricCredential(
      memberId,
      credentialId,
    );
    if (!updated) throw new NotFoundException(`Member ${memberId} not found`);
    return { success: true };
  }

  async listBiometricMembers() {
    const members = await this.gymData.listMembersForCheckIn();
    return { success: true, data: members };
  }

  async getMemberBiometricStatus(memberId: string) {
    const has = await this.gymData.hasMemberBiometricCredential(memberId);
    return { hasCredential: !!has };
  }

  async biometricCheckin(payload: {
    memberId?: string;
    credentialId: string;
    duration?: number;
    activities?: string[];
  }) {
    const { memberId, credentialId, duration, activities } = payload;

    const resolvedMember = memberId
      ? await this.gymData.getMember(memberId)
      : await this.gymData.findMemberByBiometricCredential(credentialId);

    if (!resolvedMember) {
      throw new NotFoundException(
        memberId
          ? `Member ${memberId} not found`
          : 'No member found with the provided biometric credential',
      );
    }

    const stored = await this.gymData.getMemberBiometricCredential(resolvedMember.id);
    if (!stored) {
      throw new NotFoundException(
        `Member ${resolvedMember.id} has no biometric credential`,
      );
    }

    if (stored !== credentialId) {
      return { success: false, message: 'Credential mismatch' };
    }

    const attendance = await this.gymData.recordCheckIn(resolvedMember.id, {
      duration,
      activities,
    });
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

  async findByClientId(clientId: string): Promise<AttendanceResponseDto[]> {
    const client = await this.gymData.getMember(clientId);
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    return client.attendance.map((attendance) =>
      this.mapToResponseDto(clientId, attendance),
    );
  }

  async findAll(): Promise<AttendanceResponseDto[]> {
    const listed = await this.gymData.listMembers({ page: 1, limit: 100 });
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
