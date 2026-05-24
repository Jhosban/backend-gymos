import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAttendanceDto {
  @IsNotEmpty()
  clientId: string;

  @IsOptional()
  attendedAt?: string;

  @IsOptional()
  duration?: number;

  @IsOptional()
  activities?: string[];

  @IsOptional()
  note?: string;
}

export class AttendanceResponseDto {
  id: string;
  clientId: string;
  attendedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class QrCheckInDto {
  qrData: string;
  duration?: number;
  activities?: string[];
}

export class BiometricRegisterDto {
  memberId: string;
  credentialId: string;
}

export class BiometricCheckinDto {
  memberId: string;
  credentialId: string;
  duration?: number;
  activities?: string[];
}
