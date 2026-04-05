import { ClientStatus } from '@prisma/client';

export class ClientStatusDto {
  id: number;
  name: string;
  email: string;
  status: ClientStatus;
  lastAttendance: Date | null;
  daysSinceAttendance: number | null;
}

export class RetentionStatusResponseDto {
  active: ClientStatusDto[];
  atRisk: ClientStatusDto[];
  inactive: ClientStatusDto[];
  summary: {
    totalClients: number;
    activeCount: number;
    atRiskCount: number;
    inactiveCount: number;
  };
}

export class RecalculateRetentionResponseDto {
  message: string;
  updatedCount: number;
  timestamp: Date;
}
