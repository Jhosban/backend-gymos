import { Injectable } from '@nestjs/common';
import { GymDataService } from '@/shared/gym-data.service';
import {
  ClientStatusDto,
  RetentionStatusResponseDto,
  RecalculateRetentionResponseDto,
} from './dtos/retention.dto';

@Injectable()
export class RetentionService {
  constructor(
    private gymData: GymDataService,
  ) {}

  /**
   * Get current retention status for all clients
   * Calculates status based on last attendance date
   */
  async getStatus(): Promise<RetentionStatusResponseDto> {
    const retention = await this.gymData.getRetentionStatus();

    return {
      active: retention.active.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        status: 'ACTIVE',
        lastAttendance: member.lastCheckIn ? new Date(member.lastCheckIn) : null,
        daysSinceAttendance: member.lastCheckIn
          ? Math.floor((Date.now() - new Date(member.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24))
          : null,
      })),
      atRisk: retention.atRisk.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        status: 'AT_RISK',
        lastAttendance: member.lastCheckIn ? new Date(member.lastCheckIn) : null,
        daysSinceAttendance: member.lastCheckIn
          ? Math.floor((Date.now() - new Date(member.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24))
          : null,
      })),
      inactive: retention.inactive.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        status: 'INACTIVE',
        lastAttendance: member.lastCheckIn ? new Date(member.lastCheckIn) : null,
        daysSinceAttendance: member.lastCheckIn
          ? Math.floor((Date.now() - new Date(member.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24))
          : null,
      })),
      summary: retention.summary,
    };
  }

  /**
   * Recalculate and update client statuses based on attendance
   * This is the core business logic for retention tracking
   */
  async recalculateStatus(): Promise<RecalculateRetentionResponseDto> {
    return await this.gymData.recalculateRetention();
  }

  /**
   * Get clients at risk (for proactive retention campaigns)
   */
  async getAtRiskClients(): Promise<ClientStatusDto[]> {
    const members = await this.gymData.getAtRiskMembers();
    return members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      status: member.status === 'at-risk' ? 'AT_RISK' : member.status === 'active' ? 'ACTIVE' : 'INACTIVE',
      lastAttendance: member.lastCheckIn ? new Date(member.lastCheckIn) : null,
      daysSinceAttendance: member.lastCheckIn ? Math.floor((Date.now() - new Date(member.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24)) : null,
    }));
  }

  async getHighRiskClients(): Promise<ClientStatusDto[]> {
    const members = await this.gymData.getHighRiskMembers();
    return members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      status: member.status === 'at-risk' ? 'AT_RISK' : member.status === 'active' ? 'ACTIVE' : 'INACTIVE',
      lastAttendance: member.lastCheckIn ? new Date(member.lastCheckIn) : null,
      daysSinceAttendance: member.lastCheckIn ? Math.floor((Date.now() - new Date(member.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24)) : null,
    }));
  }
}
