import { ClientStatus } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone: string;
}

export class UpdateClientDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}

export class ClientResponseDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
  lastAttendance: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
