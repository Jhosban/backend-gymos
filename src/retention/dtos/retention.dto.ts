export class ClientStatusDto {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'AT_RISK' | 'INACTIVE';
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
  timestamp: string;
}
