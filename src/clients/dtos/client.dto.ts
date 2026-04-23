import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { CreateMemberInput, UpdateMemberInput, Member } from '@/shared/gym-data.service';

export class CreateClientDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  phone: string;

  @IsOptional()
  goal?: string;

  @IsOptional()
  experienceLevel?: CreateMemberInput['experienceLevel'];

  @IsOptional()
  membershipType?: CreateMemberInput['membershipType'];

  @IsOptional()
  joinedAt?: string;

  @IsOptional()
  membershipEnd?: string;

  @IsOptional()
  monthlyPrice?: number;

  @IsOptional()
  membershipStatus?: CreateMemberInput['membershipStatus'];

  @IsOptional()
  preferredSchedule?: CreateMemberInput['preferredSchedule'];

  @IsOptional()
  acquisitionSource?: CreateMemberInput['acquisitionSource'];

  @IsOptional()
  assignedTrainer?: string;

  @IsOptional()
  notes?: string;
}

export class UpdateClientDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  goal?: string;

  @IsOptional()
  experienceLevel?: UpdateMemberInput['experienceLevel'];

  @IsOptional()
  membershipType?: UpdateMemberInput['membershipType'];

  @IsOptional()
  joinedAt?: string;

  @IsOptional()
  membershipEnd?: string;

  @IsOptional()
  monthlyPrice?: number;

  @IsOptional()
  membershipStatus?: UpdateMemberInput['membershipStatus'];

  @IsOptional()
  preferredSchedule?: UpdateMemberInput['preferredSchedule'];

  @IsOptional()
  acquisitionSource?: UpdateMemberInput['acquisitionSource'];

  @IsOptional()
  assignedTrainer?: string;

  @IsOptional()
  notes?: string;
}

export class ClientResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: Member['status'];
  lastCheckIn?: string | null;
  createdAt: string;
  updatedAt: string;
}
