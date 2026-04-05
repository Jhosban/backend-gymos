import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAttendanceDto {
  @IsNotEmpty()
  clientId: number;

  @IsOptional()
  attendedAt?: Date;
}

export class AttendanceResponseDto {
  id: number;
  clientId: number;
  attendedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
