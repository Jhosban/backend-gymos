import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@/prisma/prisma.service';
import { AppConfigService } from '@/config/app.config';

let cachedGymId: string | null = null;

async function getDefaultGymId(prisma: PrismaService): Promise<string> {
  if (cachedGymId) return cachedGymId;
  const gym = await prisma.gym.findFirst();
  if (!gym) throw new Error('No gym found');
  cachedGymId = gym.id;
  return gym.id;
}

type ExperienceLevel = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
type MembershipStatus = 'ACTIVO' | 'CONGELADO' | 'VENCIDO' | 'CANCELADO';
type PreferredSchedule = 'MANANA' | 'TARDE' | 'NOCHE';
type AcquisitionSource = 'INSTAGRAM' | 'GOOGLE' | 'REFERIDO' | 'CALLE' | 'FACEBOOK';
type LeadSource = 'INSTAGRAM' | 'GOOGLE' | 'REFERIDO' | 'WALK_IN' | 'FACEBOOK';
type PrismaLeadStatus =
  | 'NUEVO'
  | 'CONTACTADO'
  | 'TOUR_AGENDADO'
  | 'TOUR_REALIZADO'
  | 'PROPUESTA'
  | 'NEGOCIACION'
  | 'CERRADO_GANADO'
  | 'CERRADO_PERDIDO';
type PrismaEquipmentCategory =
  | 'CARDIO'
  | 'PESAS'
  | 'MAQUINAS'
  | 'FUNCIONAL'
  | 'ACCESORIOS';
type PrismaEquipmentStatus =
  | 'OPERATIVO'
  | 'EN_MANTENIMIENTO'
  | 'FUERA_SERVICIO'
  | 'NUEVO';
type PrismaMaintenanceStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO';
type PrismaMaintenanceType = 'PREVENTIVO' | 'CORRECTIVO' | 'INSPECCION';
type PrismaAlertType =
  | 'AUSENCIA_PROLONGADA'
  | 'PAGO_FALLIDO'
  | 'BAJO_ENGAGEMENT'
  | 'QUEJA_RECIENTE'
  | 'CUMPLEANOS_PROXIMO'
  | 'MILESTONE_ALCANZADO';
type PrismaAlertSeverity = 'INFORMATIVA' | 'ACCION_REQUERIDA' | 'CRITICA';
type PrismaAlertStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'RESUELTA';
type UserRole = 'ADMIN' | 'TRAINER' | 'ADVISOR' | 'USER';

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ClientStatus = 'active' | 'at-risk' | 'inactive';
export type ChurnRiskLevel = 'bajo' | 'medio' | 'alto' | 'critico';
export type MembershipType = 'basica' | 'premium' | 'vip' | 'estudiante';
export type LeadStatus =
  | 'nuevo'
  | 'contactado'
  | 'tour_agendado'
  | 'tour_realizado'
  | 'propuesta'
  | 'negociacion'
  | 'cerrado_ganado'
  | 'cerrado_perdido';
export type LeadSourceType =
  | 'instagram'
  | 'google'
  | 'referido'
  | 'walk_in'
  | 'facebook'
  | 'calle';
export type ProductType =
  | 'fitness_product'
  | 'membership'
  | 'personal_training'
  | 'combo';
export type ServiceType =
  | 'basica'
  | 'premium'
  | 'vip'
  | 'estudiante'
  | 'individual'
  | 'grupal'
  | 'funcional';

// Product-specific details types
export type MembershipDetails = {
  membershipType: string; // e.g., "basica", "premium", "vip", "estudiante"
  durationMonths: number;
  pricePerPeriod: number;
  periodicity: 'monthly' | 'quarterly' | 'annual';
  startDate: string;
  endDate?: string;
  autoRenewal: boolean;
  includedAccess: string[]; // e.g., ["gym", "pool", "sauna"]
  enrollmentFee: number;
};

export type PersonalTrainingDetails = {
  serviceType: 'individual' | 'group' | 'functional';
  assignedTrainer?: string;
  numberOfSessions: number;
  sessionDurationMinutes: number;
  modality: 'in-person' | 'virtual' | 'hybrid';
  pricePerSession: number;
  packagePrice?: number;
  firstSessionDate: string;
  clientObjective: string;
  initialEvaluationRequired: boolean;
};

export type FitnessProductDetails = {
  productName: string;
  sku: string;
  category: 'equipment' | 'supplements' | 'clothing';
  quantity: number;
  unitPrice: number;
  size?: string;
  color?: string;
  availableStock: number;
  brand: string;
};

export type ComboDetails = {
  comboType: string;
  components: Array<{
    type: 'membership' | 'product' | 'training';
    description: string;
    value?: number;
  }>;
  normalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  isRecurring: boolean;
};

export type ProductDetails =
  | MembershipDetails
  | PersonalTrainingDetails
  | FitnessProductDetails
  | ComboDetails;
export type EquipmentCategory =
  | 'cardio'
  | 'pesas'
  | 'maquinas'
  | 'funcional'
  | 'accesorios';
export type EquipmentStatus =
  | 'operativo'
  | 'en_mantenimiento'
  | 'fuera_servicio'
  | 'nuevo';
export type MaintenanceType = 'preventivo' | 'correctivo' | 'inspeccion';
export type MaintenanceStatus = 'pendiente' | 'en_progreso' | 'completado';
export type AlertType =
  | 'ausencia_prolongada'
  | 'pago_fallido'
  | 'bajo_engagement'
  | 'queja_reciente'
  | 'cumpleanos_proximo'
  | 'milestone_alcanzado';
export type AlertSeverity = 'informativa' | 'accion_requerida' | 'critica';
export type AlertStatus = 'pendiente' | 'en_progreso' | 'resuelta';

export type AttendanceRecord = {
  date: string;
  duration?: number;
  activities?: string[];
  note?: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'Otro';
  goal: string;
  experienceLevel: 'principiante' | 'intermedio' | 'avanzado';
  membershipType: MembershipType;
  joinedAt: string;
  membershipEnd?: string;
  monthlyPrice: number;
  membershipStatus: 'activo' | 'congelado' | 'vencido' | 'cancelado';
  status: ClientStatus;
  lastCheckIn?: string | null;
  checkInsLast30Days: number;
  averageCheckInsPerWeek: number;
  preferredSchedule?: 'manana' | 'tarde' | 'noche';
  churnRiskScore: number;
  churnRiskLevel: ChurnRiskLevel;
  acquisitionSource?: LeadSourceType;
  assignedTrainer?: string;
  notes?: string;
  attendance: AttendanceRecord[];
  createdAt: string;
  updatedAt: string;
  hasBiometricCredential?: boolean;
  photoUrl?: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSourceType;
  status: LeadStatus;
  assignedAdvisor: string;
  productType: ProductType;
  productDetails?: ProductDetails | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type MaintenanceRecord = {
  id: string;
  equipmentId: string;
  type: MaintenanceType;
  description: string;
  technician?: string;
  cost?: number;
  scheduledDate: string;
  completedDate?: string;
  status: MaintenanceStatus;
  notes?: string;
  createdAt: string;
};

export type Equipment = {
  id: string;
  name: string;
  category: EquipmentCategory;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: string;
  warrantyEnd?: string;
  price?: number;
  status: EquipmentStatus;
  location?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceIntervalDays: number;
  totalUsageHours?: number;
  maintenanceHistory: MaintenanceRecord[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type RetentionAlert = {
  id: string;
  clientId: string;
  clientName: string;
  type: AlertType;
  severity: AlertSeverity;
  description: string;
  daysSinceLastVisit?: number;
  recommendedAction: string;
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'trainer' | 'advisor' | 'user';
  createdAt: string;
  updatedAt: string;
};

type MemberListFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  riskLevel?: string;
};

type LeadListFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

type EquipmentListFilters = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
};

type AlertListFilters = {
  status?: string;
  severity?: string;
};

export type CreateMemberInput = Partial<Member> & {
  name: string;
  email: string;
  phone: string;
};

export type UpdateMemberInput = Partial<CreateMemberInput>;

export type CreateLeadInput = Partial<Lead> & {
  name: string;
  email: string;
  phone: string;
  source: LeadSourceType;
  productType?: ProductType;
  productDetails?: Record<string, any>;
};

export type UpdateLeadInput = Partial<CreateLeadInput>;

export type CreateEquipmentInput = Partial<Equipment> & {
  name: string;
  category: EquipmentCategory;
  purchaseDate: string;
  maintenanceIntervalDays: number;
};

export type UpdateEquipmentInput = Partial<CreateEquipmentInput>;

export type CreateMaintenanceInput = Omit<
  MaintenanceRecord,
  'id' | 'equipmentId' | 'createdAt'
> & {
  scheduledDate: string;
};

export type CreateAlertInput = Omit<
  RetentionAlert,
  'id' | 'createdAt' | 'resolvedAt'
> & {
  createdAt?: string;
  resolvedAt?: string;
};

export type CheckInInput = {
  duration?: number;
  activities?: string[];
  note?: string;
  attendedAt?: string;
};

@Injectable()
export class GymDataService {
  constructor(
    private prisma: PrismaService,
    private config: AppConfigService,
  ) {}

  private daysBetween(from: string, to = new Date().toISOString()): number {
    return Math.floor(
      (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  private parseActivities(activities?: string | null): string[] | undefined {
    if (!activities) return undefined;
    try {
      const parsed = JSON.parse(activities);
      return Array.isArray(parsed) ? parsed : undefined;
    } catch {
      return activities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  private toClientStatus(status: string): ClientStatus {
    if (status === 'ACTIVE') return 'active';
    if (status === 'AT_RISK') return 'at-risk';
    return 'inactive';
  }

  private fromClientStatus(status?: string): string | undefined {
    if (!status) return undefined;
    if (status === 'active' || status === 'ACTIVE') return 'ACTIVE';
    if (status === 'at-risk' || status === 'AT_RISK') return 'AT_RISK';
    if (status === 'inactive' || status === 'INACTIVE') return 'INACTIVE';
    return undefined;
  }

  private toChurnRiskLevel(level: string): ChurnRiskLevel {
    if (level === 'CRITICO') return 'critico';
    if (level === 'ALTO') return 'alto';
    if (level === 'MEDIO') return 'medio';
    return 'bajo';
  }

  private fromChurnRiskLevel(level?: string): string | undefined {
    if (!level) return undefined;
    if (level === 'critico' || level === 'CRITICO') return 'CRITICO';
    if (level === 'alto' || level === 'ALTO') return 'ALTO';
    if (level === 'medio' || level === 'MEDIO') return 'MEDIO';
    if (level === 'bajo' || level === 'BAJO') return 'BAJO';
    return undefined;
  }

  private toMembershipType(type: string): MembershipType {
    if (type === 'ESTUDIANTE') return 'estudiante';
    if (type === 'VIP') return 'vip';
    if (type === 'PREMIUM') return 'premium';
    return 'basica';
  }

  private fromMembershipType(type?: string): string | undefined {
    if (!type) return undefined;
    if (type === 'basica' || type === 'BASICA') return 'BASICA';
    if (type === 'premium' || type === 'PREMIUM') return 'PREMIUM';
    if (type === 'vip' || type === 'VIP') return 'VIP';
    if (type === 'estudiante' || type === 'ESTUDIANTE') return 'ESTUDIANTE';
    return undefined;
  }

  private toLeadSource(source: string): LeadSourceType {
    if (source === 'WALK_IN') return 'walk_in';
    return source.toLowerCase() as LeadSourceType;
  }

  private fromLeadSource(source?: string): string | undefined {
    if (!source) return undefined;
    if (source === 'calle') return 'WALK_IN';
    if (source === 'walk_in' || source === 'WALK_IN') return 'WALK_IN';
    return source.toUpperCase() as LeadSource;
  }

  private toLeadStatus(status: string): LeadStatus {
    return status.toLowerCase() as LeadStatus;
  }

  private fromLeadStatus(status?: string): string | undefined {
    if (!status) return undefined;
    return status.toUpperCase() as PrismaLeadStatus;
  }

  private toEquipmentCategory(category: string): EquipmentCategory {
    return category.toLowerCase() as EquipmentCategory;
  }

  private fromEquipmentCategory(category?: string): string | undefined {
    if (!category) return undefined;
    return category.toUpperCase() as PrismaEquipmentCategory;
  }

  private toEquipmentStatus(status: string): EquipmentStatus {
    return status.toLowerCase() as EquipmentStatus;
  }

  private fromEquipmentStatus(status?: string): string | undefined {
    if (!status) return undefined;
    return status.toUpperCase() as PrismaEquipmentStatus;
  }

  private toMaintenanceType(type: string): MaintenanceType {
    return type.toLowerCase() as MaintenanceType;
  }

  private fromMaintenanceType(type?: string): string | undefined {
    if (!type) return undefined;
    return type.toUpperCase() as PrismaMaintenanceType;
  }

  private toMaintenanceStatus(status: string): MaintenanceStatus {
    return status.toLowerCase() as MaintenanceStatus;
  }

  private fromMaintenanceStatus(status?: string): string | undefined {
    if (!status) return undefined;
    return status.toUpperCase() as PrismaMaintenanceStatus;
  }

  private toAlertType(type: string): AlertType {
    return type.toLowerCase() as AlertType;
  }

  private fromAlertType(type?: string): string | undefined {
    if (!type) return undefined;
    return type.toUpperCase() as PrismaAlertType;
  }

  private toAlertSeverity(severity: string): AlertSeverity {
    return severity.toLowerCase() as AlertSeverity;
  }

  private fromAlertSeverity(severity?: string): string | undefined {
    if (!severity) return undefined;
    return severity.toUpperCase() as PrismaAlertSeverity;
  }

  private toAlertStatus(status: string): AlertStatus {
    return status.toLowerCase() as AlertStatus;
  }

  private fromAlertStatus(status?: string): string | undefined {
    if (!status) return undefined;
    return status.toUpperCase() as PrismaAlertStatus;
  }

  private fromGoal(goal?: string): string | undefined {
    if (!goal) return undefined;
    const normalized = goal.toUpperCase().replace('-', '_');
    if (normalized === 'SALUD_GENERAL') return 'SALUD_GENERAL';
    if (normalized === 'PERDER_PESO') return 'PERDER_PESO';
    if (normalized === 'GANAR_MUSCULO') return 'GANAR_MUSCULO';
    if (normalized === 'RESISTENCIA') return 'RESISTENCIA';
    if (normalized === 'RENDIMIENTO') return 'RENDIMIENTO';
    return undefined;
  }

  private toGoal(goal: string): string {
    return goal.toLowerCase();
  }

  private fromExperienceLevel(level?: string): string | undefined {
    if (!level) return undefined;
    return level.toUpperCase() as ExperienceLevel;
  }

  private toExperienceLevel(level: string): Member['experienceLevel'] {
    return level.toLowerCase() as Member['experienceLevel'];
  }

  private fromMembershipStatus(status?: string): string | undefined {
    if (!status) return undefined;
    return status.toUpperCase() as MembershipStatus;
  }

  private toMembershipStatus(status: string): Member['membershipStatus'] {
    return status.toLowerCase() as Member['membershipStatus'];
  }

  private fromPreferredSchedule(schedule?: string): string | undefined {
    if (!schedule) return undefined;
    return schedule.toUpperCase() as PreferredSchedule;
  }

  private toPreferredSchedule(
    schedule: string | null,
  ): Member['preferredSchedule'] | undefined {
    if (!schedule) return undefined;
    return schedule.toLowerCase() as Member['preferredSchedule'];
  }

  private fromAcquisitionSource(source?: string): string | undefined {
    if (!source) return undefined;
    if (source === 'walk_in') return 'CALLE';
    return source.toUpperCase() as AcquisitionSource;
  }

  private toAcquisitionSource(source: string | null): LeadSourceType | undefined {
    if (!source) return undefined;
    return source.toLowerCase() as LeadSourceType;
  }

  private calculateStatus(lastCheckIn?: string | null): ClientStatus {
    if (!lastCheckIn) return 'inactive';
    const days = this.daysBetween(lastCheckIn);
    if (days <= this.config.retentionAtRiskDays) return 'active';
    if (days <= this.config.retentionInactiveDays) return 'at-risk';
    return 'inactive';
  }

  private calculateChurnRisk(member: Partial<Member>): {
    score: number;
    level: ChurnRiskLevel;
  } {
    let score = 0;

    if (member.lastCheckIn) {
      const daysSinceVisit = this.daysBetween(member.lastCheckIn);
      if (daysSinceVisit > 21) score += 40;
      else if (daysSinceVisit > 14) score += 30;
      else if (daysSinceVisit > 7) score += 20;
      else if (daysSinceVisit > 3) score += 10;
    } else {
      score += 40;
    }

    const expectedVisits =
      member.experienceLevel === 'principiante'
        ? 2
        : member.experienceLevel === 'intermedio'
          ? 3.5
          : 4.5;
    const ratio =
      expectedVisits > 0 ? (member.averageCheckInsPerWeek ?? 0) / expectedVisits : 0;
    if (ratio < 0.3) score += 30;
    else if (ratio < 0.6) score += 15;
    else if (ratio < 0.8) score += 5;

    if (member.membershipEnd) {
      const daysUntilExpiry = this.daysBetween(
        new Date().toISOString(),
        member.membershipEnd,
      );
      if (daysUntilExpiry <= 7) score += 20;
      else if (daysUntilExpiry <= 30) score += 10;
    }

    if (member.experienceLevel === 'principiante') score += 10;

    const capped = Math.min(score, 100);
    const level: ChurnRiskLevel =
      capped >= 75
        ? 'critico'
        : capped >= 50
          ? 'alto'
          : capped >= 25
            ? 'medio'
            : 'bajo';
    return { score: capped, level };
  }

  private toProductType(type: string): ProductType {
    if (type === 'MEMBERSHIP') return 'membership';
    if (type === 'PERSONAL_TRAINING') return 'personal_training';
    if (type === 'COMBO') return 'combo';
    return 'fitness_product';
  }

  private fromProductType(type?: string): string | undefined {
    if (!type) return 'FITNESS_PRODUCT';
    if (type === 'membership' || type === 'MEMBERSHIP') return 'MEMBERSHIP';
    if (type === 'personal_training' || type === 'PERSONAL_TRAINING')
      return 'PERSONAL_TRAINING';
    if (type === 'combo' || type === 'COMBO') return 'COMBO';
    return 'FITNESS_PRODUCT';
  }

  private toMemberDTO(
    member: Prisma.MemberGetPayload<{ include: { attendance: true } }>,
  ): Member {
    const attendance = member.attendance
      .sort((a, b) => a.attendedAt.getTime() - b.attendedAt.getTime())
      .map((item) => ({
        date: item.attendedAt.toISOString(),
        duration: item.duration ?? undefined,
        activities: this.parseActivities(item.activities),
        note: item.note ?? undefined,
      }));

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      birthDate: member.birthDate?.toISOString(),
      gender:
        member.gender === 'OTRO'
          ? 'Otro'
          : ((member.gender as Member['gender']) ?? undefined),
      goal: this.toGoal(member.goal),
      experienceLevel: this.toExperienceLevel(member.experienceLevel),
      membershipType: this.toMembershipType(member.membershipType),
      joinedAt: member.joinedAt.toISOString(),
      membershipEnd: member.membershipEnd?.toISOString(),
      monthlyPrice: member.monthlyPrice,
      membershipStatus: this.toMembershipStatus(member.membershipStatus),
      status: this.toClientStatus(member.status),
      lastCheckIn: member.lastCheckIn?.toISOString() ?? null,
      checkInsLast30Days: member.checkInsLast30Days,
      averageCheckInsPerWeek: member.averageCheckInsPerWeek,
      preferredSchedule: this.toPreferredSchedule(member.preferredSchedule),
      churnRiskScore: member.churnRiskScore,
      churnRiskLevel: this.toChurnRiskLevel(member.churnRiskLevel),
      acquisitionSource: this.toAcquisitionSource(member.acquisitionSource),
      assignedTrainer: member.assignedTrainer ?? undefined,
      notes: member.notes ?? undefined,
      attendance,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
      // Indica si tiene credencial biométrica registrada
      // (no exponemos el id por seguridad)
      hasBiometricCredential: !!(member as any).biometricCredentialId,
      photoUrl: member.photoUrl ?? undefined,
    };
  }

  private paginate(page?: number, limit?: number) {
    const p = Math.max(page ?? 1, 1);
    const l = Math.min(Math.max(limit ?? 50, 1), 100);
    return { skip: (p - 1) * l, take: l, page: p, limit: l };
  }

  // Auth
  async findUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return undefined;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role.toLowerCase() as User['role'],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async findUserById(id: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return undefined;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role.toLowerCase() as User['role'],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async createUser(
    email: string,
    name: string,
    password: string,
    role: User['role'] = 'admin',
  ): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: bcrypt.hashSync(password, 10),
        role: role.toUpperCase() as UserRole,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role.toLowerCase() as User['role'],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: bcrypt.hashSync(newPassword, 10) },
    });
  }

  async listUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role.toLowerCase() as User['role'],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));
  }

  // Members
  async listMembers(
    filters: MemberListFilters = {},
    gymId?: string,
  ): Promise<{ members: Member[]; pagination: PaginationMeta }> {
    const { skip, take, page, limit } = this.paginate(filters.page, filters.limit);
    const where: Prisma.MemberWhereInput = {
      ...(gymId && { gymId }),
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }

    if (filters.status) {
      const status = this.fromClientStatus(filters.status);
      const membershipStatus = this.fromMembershipStatus(filters.status);
      if (status || membershipStatus) {
        where.OR = [
          ...(where.OR ?? []),
          ...(status ? [{ status }] : []),
          ...(membershipStatus ? [{ membershipStatus }] : []),
        ];
      }
    }

    if (filters.riskLevel) {
      const risk = this.fromChurnRiskLevel(filters.riskLevel);
      if (risk) where.churnRiskLevel = risk;
    }

    const [total, members] = await Promise.all([
      this.prisma.member.count({ where }),
      this.prisma.member.findMany({
        where,
        include: { attendance: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    return {
      members: members.map((member) => this.toMemberDTO(member)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    };
  }

  async getMember(id: string, gymId?: string): Promise<Member | undefined> {
    const member = await this.prisma.member.findFirst({
      where: {
        id,
        ...(gymId && { gymId }),
      },
      include: { attendance: true },
    });
    return member ? this.toMemberDTO(member) : undefined;
  }

  async createMember(input: CreateMemberInput, gymId?: string): Promise<Member> {
    const now = new Date();
    const provisional: Partial<Member> = {
      ...input,
      experienceLevel:
        (input.experienceLevel as Member['experienceLevel']) ?? 'principiante',
      averageCheckInsPerWeek: input.averageCheckInsPerWeek ?? 0,
      membershipEnd: input.membershipEnd,
      lastCheckIn: input.lastCheckIn ?? null,
    };

    const status = this.calculateStatus(provisional.lastCheckIn);
    const churn = this.calculateChurnRisk(provisional);

    const resolvedGymId = gymId ?? (await getDefaultGymId(this.prisma));

    const member = await this.prisma.member.create({
      data: {
        ...(input.id ? { id: input.id } : {}),
        gymId: resolvedGymId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
        gender: input.gender === 'Otro' ? 'OTRO' : (input.gender as any),
        goal: this.fromGoal(input.goal) ?? 'SALUD_GENERAL',
        experienceLevel:
          this.fromExperienceLevel(input.experienceLevel) ?? 'PRINCIPIANTE',
        membershipType: this.fromMembershipType(input.membershipType) ?? 'BASICA',
        joinedAt: input.joinedAt ? new Date(input.joinedAt) : now,
        membershipEnd: input.membershipEnd ? new Date(input.membershipEnd) : undefined,
        monthlyPrice: Number(input.monthlyPrice ?? 0),
        membershipStatus: this.fromMembershipStatus(input.membershipStatus) ?? 'ACTIVO',
        status: this.fromClientStatus(status) ?? 'INACTIVE',
        lastCheckIn: input.lastCheckIn ? new Date(input.lastCheckIn) : undefined,
        checkInsLast30Days: input.checkInsLast30Days ?? 0,
        averageCheckInsPerWeek: input.averageCheckInsPerWeek ?? 0,
        preferredSchedule: this.fromPreferredSchedule(input.preferredSchedule),
        churnRiskScore: churn.score,
        churnRiskLevel: this.fromChurnRiskLevel(churn.level) ?? 'BAJO',
        acquisitionSource: this.fromAcquisitionSource(input.acquisitionSource),
        assignedTrainer: input.assignedTrainer,
        notes: input.notes,
        photoUrl: input.photoUrl,
      },
      include: { attendance: true },
    });

    return this.toMemberDTO(member);
  }

  async updateMember(
    id: string,
    input: UpdateMemberInput,
    gymId?: string,
  ): Promise<Member | undefined> {
    const existing = await this.prisma.member.findFirst({
      where: {
        id,
        ...(gymId && { gymId }),
      },
      include: { attendance: true },
    });
    if (!existing) return undefined;

    const mergedForCalc: Partial<Member> = {
      ...this.toMemberDTO(existing),
      ...input,
      lastCheckIn: input.lastCheckIn ?? existing.lastCheckIn?.toISOString() ?? null,
      membershipEnd: input.membershipEnd ?? existing.membershipEnd?.toISOString(),
      experienceLevel:
        (input.experienceLevel as Member['experienceLevel']) ??
        this.toExperienceLevel(existing.experienceLevel),
      averageCheckInsPerWeek:
        input.averageCheckInsPerWeek ?? existing.averageCheckInsPerWeek,
    };

    const status = this.calculateStatus(mergedForCalc.lastCheckIn);
    const churn = this.calculateChurnRisk(mergedForCalc);

    const updated = await this.prisma.member.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
        gender: input.gender === 'Otro' ? 'OTRO' : (input.gender as any),
        goal: this.fromGoal(input.goal) ?? undefined,
        experienceLevel: this.fromExperienceLevel(input.experienceLevel),
        membershipType: this.fromMembershipType(input.membershipType),
        joinedAt: input.joinedAt ? new Date(input.joinedAt) : undefined,
        membershipEnd: input.membershipEnd ? new Date(input.membershipEnd) : undefined,
        monthlyPrice: input.monthlyPrice,
        membershipStatus: this.fromMembershipStatus(input.membershipStatus),
        status: this.fromClientStatus(status),
        lastCheckIn: input.lastCheckIn ? new Date(input.lastCheckIn) : undefined,
        checkInsLast30Days: input.checkInsLast30Days,
        averageCheckInsPerWeek: input.averageCheckInsPerWeek,
        preferredSchedule: this.fromPreferredSchedule(input.preferredSchedule),
        churnRiskScore: churn.score,
        churnRiskLevel: this.fromChurnRiskLevel(churn.level),
        acquisitionSource: this.fromAcquisitionSource(input.acquisitionSource),
        assignedTrainer: input.assignedTrainer,
        notes: input.notes,
        photoUrl: input.photoUrl,
      },
      include: { attendance: true },
    });

    return this.toMemberDTO(updated);
  }

  async setMemberBiometricCredential(
    memberId: string,
    credentialId: string,
  ): Promise<boolean> {
    try {
      const updated = await this.prisma.member.update({
        where: { id: memberId },
        data: { biometricCredentialId: credentialId },
        include: { attendance: true },
      });
      return !!updated;
    } catch (err) {
      return false;
    }
  }

  async listMembersForCheckIn(
    gymId?: string,
  ): Promise<Array<{ id: string; name: string; hasBiometricCredential: boolean }>> {
    const resolvedGymId = gymId ?? (await getDefaultGymId(this.prisma));
    const members = await this.prisma.member.findMany({
      where: { gymId: resolvedGymId },
      select: {
        id: true,
        name: true,
        biometricCredentialId: true,
      },
      orderBy: { name: 'asc' },
    });

    return members.map((member) => ({
      id: member.id,
      name: member.name,
      hasBiometricCredential: !!member.biometricCredentialId,
    }));
  }

  async findMemberByBiometricCredential(
    credentialId: string,
    gymId?: string,
  ): Promise<Member | undefined> {
    const resolvedGymId = gymId ?? (await getDefaultGymId(this.prisma));
    const member = await this.prisma.member.findFirst({
      where: {
        gymId: resolvedGymId,
        biometricCredentialId: credentialId,
      },
      include: { attendance: true },
    });

    return member ? this.toMemberDTO(member) : undefined;
  }

  async hasMemberBiometricCredential(memberId: string): Promise<boolean> {
    const m = await this.prisma.member.findUnique({ where: { id: memberId } });
    return !!m?.biometricCredentialId;
  }

  async getMemberBiometricCredential(memberId: string): Promise<string | null> {
    const m = await this.prisma.member.findUnique({ where: { id: memberId } });
    return m?.biometricCredentialId ?? null;
  }

  async deleteMember(id: string, gymId?: string): Promise<boolean> {
    const member = await this.prisma.member.findFirst({
      where: {
        id,
        ...(gymId && { gymId }),
      },
    });
    if (!member) return false;
    const result = await this.prisma.member.deleteMany({ where: { id } });
    await this.prisma.retentionAlert.deleteMany({ where: { clientId: id } });
    return result.count > 0;
  }

  async recordCheckIn(
    id: string,
    input: CheckInInput = {},
    gymId?: string,
  ): Promise<AttendanceRecord | undefined> {
    const member = await this.prisma.member.findFirst({
      where: {
        id,
        ...(gymId && { gymId }),
      },
      include: { attendance: true },
    });
    if (!member) return undefined;

    const attendedAt = input.attendedAt ? new Date(input.attendedAt) : new Date();

    const attendance = await this.prisma.attendance.create({
      data: {
        memberId: id,
        attendedAt,
        duration: input.duration ?? 60,
        activities: JSON.stringify(input.activities ?? ['pesas']),
        note: input.note,
      },
    });

    const totalLast30 = await this.prisma.attendance.count({
      where: {
        memberId: id,
        attendedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const avg = Math.round((totalLast30 / 4.3) * 10) / 10;
    const dto = this.toMemberDTO({
      ...member,
      attendance: [...member.attendance, attendance],
    });
    const status = this.calculateStatus(attendedAt.toISOString());
    const churn = this.calculateChurnRisk({
      ...dto,
      lastCheckIn: attendedAt.toISOString(),
      checkInsLast30Days: totalLast30,
      averageCheckInsPerWeek: avg,
    });

    await this.prisma.member.update({
      where: { id },
      data: {
        lastCheckIn: attendedAt,
        checkInsLast30Days: totalLast30,
        averageCheckInsPerWeek: avg,
        status: this.fromClientStatus(status),
        churnRiskScore: churn.score,
        churnRiskLevel: this.fromChurnRiskLevel(churn.level),
      },
    });

    return {
      date: attendance.attendedAt.toISOString(),
      duration: attendance.duration ?? undefined,
      activities: this.parseActivities(attendance.activities),
      note: attendance.note ?? undefined,
    };
  }

  async exportMembersCsv(gymId?: string): Promise<string> {
    const members = await this.prisma.member.findMany({
      where: {
        ...(gymId && { gymId }),
      },
      orderBy: { createdAt: 'desc' },
    });
    const headers = [
      'Nombre',
      'Email',
      'Teléfono',
      'Membresía',
      'Estado',
      'Riesgo',
      'Último Check-in',
    ];
    const rows = members.map((member) => [
      member.name,
      member.email,
      member.phone,
      this.toMembershipType(member.membershipType),
      this.toClientStatus(member.status),
      this.toChurnRiskLevel(member.churnRiskLevel),
      member.lastCheckIn?.toISOString() ?? 'Nunca',
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  }

  // Leads
  async listLeads(
    filters: LeadListFilters = {},
    gymId?: string,
  ): Promise<{ leads: Lead[]; pagination: PaginationMeta }> {
    const { skip, take, page, limit } = this.paginate(filters.page, filters.limit);
    const where: Prisma.LeadWhereInput = {
      ...(gymId && { gymId }),
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }

    if (filters.status) {
      const status = this.fromLeadStatus(filters.status);
      if (status) where.status = status;
    }

    const [total, leads] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    ]);

    return {
      leads: leads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: this.toLeadSource(lead.source),
        status: this.toLeadStatus(lead.status),
        assignedAdvisor: lead.assignedAdvisor,
        productType: this.toProductType(lead.productType),
        productDetails: lead.productDetails
          ? typeof lead.productDetails === 'string'
            ? JSON.parse(lead.productDetails)
            : lead.productDetails
          : undefined,
        notes: lead.notes ?? undefined,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    };
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) return undefined;
    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: this.toLeadSource(lead.source),
      status: this.toLeadStatus(lead.status),
      assignedAdvisor: lead.assignedAdvisor,
      productType: this.toProductType(lead.productType),
      productDetails: lead.productDetails
        ? typeof lead.productDetails === 'string'
          ? JSON.parse(lead.productDetails)
          : lead.productDetails
        : undefined,
      notes: lead.notes ?? undefined,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    };
  }

  async findLeadByEmailAndProductType(
    email: string,
    productType: string,
  ): Promise<Lead | undefined> {
    const existing = await this.prisma.lead.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        productType: this.fromProductType(productType) ?? 'FITNESS_PRODUCT',
      },
    });
    if (!existing) return undefined;
    return {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      phone: existing.phone,
      source: this.toLeadSource(existing.source),
      status: this.toLeadStatus(existing.status),
      assignedAdvisor: existing.assignedAdvisor,
      productType: this.toProductType(existing.productType),
      productDetails: existing.productDetails
        ? typeof existing.productDetails === 'string'
          ? JSON.parse(existing.productDetails)
          : existing.productDetails
        : undefined,
      notes: existing.notes ?? undefined,
      createdAt: existing.createdAt.toISOString(),
      updatedAt: existing.updatedAt.toISOString(),
    };
  }

  async createLead(input: CreateLeadInput, gymId?: string): Promise<Lead> {
    const source = input.source === 'calle' ? 'walk_in' : input.source;

    // Check for duplicates: same email and productType (case-insensitive)
    const resolvedGymId = gymId ?? (await getDefaultGymId(this.prisma));
    const existing = await this.prisma.lead.findFirst({
      where: {
        email: { equals: input.email, mode: 'insensitive' },
        productType: this.fromProductType(input.productType) ?? 'FITNESS_PRODUCT',
        gymId: resolvedGymId,
      },
    });

    if (existing) {
      throw new Error(
        `Lead duplicado: Ya existe un lead con email "${input.email}" del tipo "${input.productType}"`,
      );
    }

    const lead = await this.prisma.lead.create({
      data: {
        ...(input.id ? { id: input.id } : {}),
        gymId: resolvedGymId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        source: this.fromLeadSource(source) ?? 'GOOGLE',
        status: this.fromLeadStatus(input.status) ?? 'NUEVO',
        assignedAdvisor: input.assignedAdvisor ?? 'Sin asignar',
        productType: this.fromProductType(input.productType) ?? 'FITNESS_PRODUCT',
        productDetails: input.productDetails ?? null,
        notes: input.notes,
      },
    });

    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: this.toLeadSource(lead.source),
      status: this.toLeadStatus(lead.status),
      assignedAdvisor: lead.assignedAdvisor,
      productType: this.toProductType(lead.productType),
      productDetails: lead.productDetails
        ? typeof lead.productDetails === 'string'
          ? JSON.parse(lead.productDetails)
          : lead.productDetails
        : undefined,
      notes: lead.notes ?? undefined,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    };
  }

  async updateLead(id: string, input: UpdateLeadInput): Promise<Lead | undefined> {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) return undefined;

    const lead = await this.prisma.lead.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        source: input.source ? this.fromLeadSource(input.source) : undefined,
        status: this.fromLeadStatus(input.status),
        assignedAdvisor: input.assignedAdvisor,
        notes: input.notes,
        productType: input.productType
          ? this.fromProductType(input.productType)
          : undefined,
        productDetails: input.productDetails ?? undefined,
      },
    });

    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: this.toLeadSource(lead.source),
      status: this.toLeadStatus(lead.status),
      assignedAdvisor: lead.assignedAdvisor,
      productType: this.toProductType(lead.productType),
      productDetails: lead.productDetails
        ? typeof lead.productDetails === 'string'
          ? JSON.parse(lead.productDetails)
          : lead.productDetails
        : undefined,
      notes: lead.notes ?? undefined,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    };
  }

  async moveLead(id: string, status: LeadStatus): Promise<Lead | undefined> {
    return this.updateLead(id, { status });
  }

  async deleteLead(id: string): Promise<boolean> {
    const result = await this.prisma.lead.deleteMany({ where: { id } });
    return result.count > 0;
  }

  // Equipment
  async listEquipment(
    filters: EquipmentListFilters = {},
    gymId?: string,
  ): Promise<{ equipment: Equipment[]; pagination: PaginationMeta }> {
    const { skip, take, page, limit } = this.paginate(filters.page, filters.limit);
    const where: Prisma.EquipmentWhereInput = {
      ...(gymId && { gymId }),
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { brand: { contains: filters.search } },
      ];
    }

    if (filters.category) {
      const category = this.fromEquipmentCategory(filters.category);
      if (category) where.category = category;
    }

    if (filters.status) {
      const status = this.fromEquipmentStatus(filters.status);
      if (status) where.status = status;
    }

    const [total, equipment] = await Promise.all([
      this.prisma.equipment.count({ where }),
      this.prisma.equipment.findMany({
        where,
        skip,
        take,
        include: { maintenanceHistory: { orderBy: { createdAt: 'desc' } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      equipment: equipment.map((item) => ({
        id: item.id,
        name: item.name,
        category: this.toEquipmentCategory(item.category),
        brand: item.brand ?? undefined,
        model: item.model ?? undefined,
        serialNumber: item.serialNumber ?? undefined,
        purchaseDate: item.purchaseDate.toISOString(),
        warrantyEnd: item.warrantyEnd?.toISOString(),
        price: item.price ?? undefined,
        status: this.toEquipmentStatus(item.status),
        location: item.location ?? undefined,
        lastMaintenance: item.lastMaintenance?.toISOString(),
        nextMaintenance: item.nextMaintenance?.toISOString(),
        maintenanceIntervalDays: item.maintenanceIntervalDays,
        totalUsageHours: item.totalUsageHours ?? undefined,
        maintenanceHistory: item.maintenanceHistory.map((m) => ({
          id: m.id,
          equipmentId: m.equipmentId,
          type: this.toMaintenanceType(m.type),
          description: m.description,
          technician: m.technician ?? undefined,
          cost: m.cost ?? undefined,
          scheduledDate: m.scheduledDate.toISOString(),
          completedDate: m.completedDate?.toISOString(),
          status: this.toMaintenanceStatus(m.status),
          notes: m.notes ?? undefined,
          createdAt: m.createdAt.toISOString(),
        })),
        notes: item.notes ?? undefined,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    };
  }

  async getEquipment(id: string, gymId?: string): Promise<Equipment | undefined> {
    return this.getEquipmentById(id, gymId);
  }

  async createEquipment(
    input: CreateEquipmentInput,
    gymId?: string,
  ): Promise<Equipment> {
    const resolvedGymId = gymId ?? (await getDefaultGymId(this.prisma));

    const item = await this.prisma.equipment.create({
      data: {
        ...(input.id ? { id: input.id } : {}),
        gymId: resolvedGymId,
        name: input.name,
        category: this.fromEquipmentCategory(input.category) ?? 'CARDIO',
        brand: input.brand,
        model: input.model,
        serialNumber: input.serialNumber,
        purchaseDate: new Date(input.purchaseDate),
        warrantyEnd: input.warrantyEnd ? new Date(input.warrantyEnd) : undefined,
        price: input.price,
        status: this.fromEquipmentStatus(input.status) ?? 'NUEVO',
        location: input.location,
        lastMaintenance: input.lastMaintenance
          ? new Date(input.lastMaintenance)
          : undefined,
        nextMaintenance: input.nextMaintenance
          ? new Date(input.nextMaintenance)
          : undefined,
        maintenanceIntervalDays: input.maintenanceIntervalDays,
        totalUsageHours: input.totalUsageHours ?? 0,
        notes: input.notes,
      },
      include: { maintenanceHistory: true },
    });

    return {
      id: item.id,
      name: item.name,
      category: this.toEquipmentCategory(item.category),
      brand: item.brand ?? undefined,
      model: item.model ?? undefined,
      serialNumber: item.serialNumber ?? undefined,
      purchaseDate: item.purchaseDate.toISOString(),
      warrantyEnd: item.warrantyEnd?.toISOString(),
      price: item.price ?? undefined,
      status: this.toEquipmentStatus(item.status),
      location: item.location ?? undefined,
      lastMaintenance: item.lastMaintenance?.toISOString(),
      nextMaintenance: item.nextMaintenance?.toISOString(),
      maintenanceIntervalDays: item.maintenanceIntervalDays,
      totalUsageHours: item.totalUsageHours ?? undefined,
      maintenanceHistory: [],
      notes: item.notes ?? undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async updateEquipment(
    id: string,
    input: UpdateEquipmentInput,
    gymId?: string,
  ): Promise<Equipment | undefined> {
    const exists = await this.prisma.equipment.findFirst({
      where: { id, ...(gymId && { gymId }) },
    });
    if (!exists) return undefined;

    await this.prisma.equipment.update({
      where: { id },
      data: {
        name: input.name,
        category: this.fromEquipmentCategory(input.category),
        brand: input.brand,
        model: input.model,
        serialNumber: input.serialNumber,
        purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : undefined,
        warrantyEnd: input.warrantyEnd ? new Date(input.warrantyEnd) : undefined,
        price: input.price,
        status: this.fromEquipmentStatus(input.status),
        location: input.location,
        lastMaintenance: input.lastMaintenance
          ? new Date(input.lastMaintenance)
          : undefined,
        nextMaintenance: input.nextMaintenance
          ? new Date(input.nextMaintenance)
          : undefined,
        maintenanceIntervalDays: input.maintenanceIntervalDays,
        totalUsageHours: input.totalUsageHours,
        notes: input.notes,
      },
    });

    return this.getEquipmentById(id);
  }

  private async getEquipmentById(
    id: string,
    gymId?: string,
  ): Promise<Equipment | undefined> {
    const item = await this.prisma.equipment.findFirst({
      where: { id, ...(gymId && { gymId }) },
      include: { maintenanceHistory: { orderBy: { createdAt: 'desc' } } },
    });
    if (!item) return undefined;

    return {
      id: item.id,
      name: item.name,
      category: this.toEquipmentCategory(item.category),
      brand: item.brand ?? undefined,
      model: item.model ?? undefined,
      serialNumber: item.serialNumber ?? undefined,
      purchaseDate: item.purchaseDate.toISOString(),
      warrantyEnd: item.warrantyEnd?.toISOString(),
      price: item.price ?? undefined,
      status: this.toEquipmentStatus(item.status),
      location: item.location ?? undefined,
      lastMaintenance: item.lastMaintenance?.toISOString(),
      nextMaintenance: item.nextMaintenance?.toISOString(),
      maintenanceIntervalDays: item.maintenanceIntervalDays,
      totalUsageHours: item.totalUsageHours ?? undefined,
      maintenanceHistory: item.maintenanceHistory.map((m) => ({
        id: m.id,
        equipmentId: m.equipmentId,
        type: this.toMaintenanceType(m.type),
        description: m.description,
        technician: m.technician ?? undefined,
        cost: m.cost ?? undefined,
        scheduledDate: m.scheduledDate.toISOString(),
        completedDate: m.completedDate?.toISOString(),
        status: this.toMaintenanceStatus(m.status),
        notes: m.notes ?? undefined,
        createdAt: m.createdAt.toISOString(),
      })),
      notes: item.notes ?? undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async deleteEquipment(id: string, gymId?: string): Promise<boolean> {
    const result = await this.prisma.equipment.deleteMany({
      where: { id, ...(gymId && { gymId }) },
    });
    return result.count > 0;
  }

  async scheduleMaintenance(
    equipmentId: string,
    input: CreateMaintenanceInput,
  ): Promise<MaintenanceRecord | undefined> {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!equipment) return undefined;

    const record = await this.prisma.maintenanceRecord.create({
      data: {
        equipmentId,
        type: this.fromMaintenanceType(input.type) ?? 'PREVENTIVO',
        description: input.description,
        technician: input.technician,
        cost: input.cost,
        scheduledDate: new Date(input.scheduledDate),
        completedDate: input.completedDate ? new Date(input.completedDate) : undefined,
        status: this.fromMaintenanceStatus(input.status) ?? 'PENDIENTE',
        notes: input.notes,
      },
    });

    await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        nextMaintenance: new Date(input.scheduledDate),
      },
    });

    return {
      id: record.id,
      equipmentId: record.equipmentId,
      type: this.toMaintenanceType(record.type),
      description: record.description,
      technician: record.technician ?? undefined,
      cost: record.cost ?? undefined,
      scheduledDate: record.scheduledDate.toISOString(),
      completedDate: record.completedDate?.toISOString(),
      status: this.toMaintenanceStatus(record.status),
      notes: record.notes ?? undefined,
      createdAt: record.createdAt.toISOString(),
    };
  }

  async completeMaintenance(
    equipmentId: string,
    maintenanceId: string,
    notes?: string,
  ): Promise<MaintenanceRecord | undefined> {
    const record = await this.prisma.maintenanceRecord.findFirst({
      where: { id: maintenanceId, equipmentId },
    });
    if (!record) return undefined;

    const completed = await this.prisma.maintenanceRecord.update({
      where: { id: maintenanceId },
      data: {
        status: 'COMPLETADO',
        completedDate: new Date(),
        notes: notes ?? record.notes,
      },
    });

    await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        status: 'OPERATIVO',
        lastMaintenance: new Date(),
      },
    });

    return {
      id: completed.id,
      equipmentId: completed.equipmentId,
      type: this.toMaintenanceType(completed.type),
      description: completed.description,
      technician: completed.technician ?? undefined,
      cost: completed.cost ?? undefined,
      scheduledDate: completed.scheduledDate.toISOString(),
      completedDate: completed.completedDate?.toISOString(),
      status: this.toMaintenanceStatus(completed.status),
      notes: completed.notes ?? undefined,
      createdAt: completed.createdAt.toISOString(),
    };
  }

  async getMaintenanceHistory(equipmentId: string): Promise<MaintenanceRecord[]> {
    const records = await this.prisma.maintenanceRecord.findMany({
      where: { equipmentId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => ({
      id: record.id,
      equipmentId: record.equipmentId,
      type: this.toMaintenanceType(record.type),
      description: record.description,
      technician: record.technician ?? undefined,
      cost: record.cost ?? undefined,
      scheduledDate: record.scheduledDate.toISOString(),
      completedDate: record.completedDate?.toISOString(),
      status: this.toMaintenanceStatus(record.status),
      notes: record.notes ?? undefined,
      createdAt: record.createdAt.toISOString(),
    }));
  }

  // Alerts
  async listAlerts(filters: AlertListFilters = {}): Promise<RetentionAlert[]> {
    const where: Prisma.RetentionAlertWhereInput = {};

    if (filters.status) {
      const status = this.fromAlertStatus(filters.status);
      if (status) where.status = status;
    }

    if (filters.severity) {
      const severity = this.fromAlertSeverity(filters.severity);
      if (severity) where.severity = severity;
    }

    const alerts = await this.prisma.retentionAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return alerts.map((alert) => ({
      id: alert.id,
      clientId: alert.clientId,
      clientName: alert.clientName,
      type: this.toAlertType(alert.type),
      severity: this.toAlertSeverity(alert.severity),
      description: alert.description,
      daysSinceLastVisit: alert.daysSinceLastVisit ?? undefined,
      recommendedAction: alert.recommendedAction,
      status: this.toAlertStatus(alert.status),
      createdAt: alert.createdAt.toISOString(),
      resolvedAt: alert.resolvedAt?.toISOString(),
    }));
  }

  async getAlert(id: string): Promise<RetentionAlert | undefined> {
    const alert = await this.prisma.retentionAlert.findUnique({ where: { id } });
    if (!alert) return undefined;
    return {
      id: alert.id,
      clientId: alert.clientId,
      clientName: alert.clientName,
      type: this.toAlertType(alert.type),
      severity: this.toAlertSeverity(alert.severity),
      description: alert.description,
      daysSinceLastVisit: alert.daysSinceLastVisit ?? undefined,
      recommendedAction: alert.recommendedAction,
      status: this.toAlertStatus(alert.status),
      createdAt: alert.createdAt.toISOString(),
      resolvedAt: alert.resolvedAt?.toISOString(),
    };
  }

  async createAlert(input: CreateAlertInput): Promise<RetentionAlert> {
    const alert = await this.prisma.retentionAlert.create({
      data: {
        clientId: input.clientId,
        clientName: input.clientName,
        type: this.fromAlertType(input.type) ?? 'AUSENCIA_PROLONGADA',
        severity: this.fromAlertSeverity(input.severity) ?? 'INFORMATIVA',
        description: input.description,
        daysSinceLastVisit: input.daysSinceLastVisit,
        recommendedAction: input.recommendedAction,
        status: this.fromAlertStatus(input.status) ?? 'PENDIENTE',
        createdAt: input.createdAt ? new Date(input.createdAt) : new Date(),
        resolvedAt: input.resolvedAt ? new Date(input.resolvedAt) : undefined,
      },
    });

    return {
      id: alert.id,
      clientId: alert.clientId,
      clientName: alert.clientName,
      type: this.toAlertType(alert.type),
      severity: this.toAlertSeverity(alert.severity),
      description: alert.description,
      daysSinceLastVisit: alert.daysSinceLastVisit ?? undefined,
      recommendedAction: alert.recommendedAction,
      status: this.toAlertStatus(alert.status),
      createdAt: alert.createdAt.toISOString(),
      resolvedAt: alert.resolvedAt?.toISOString(),
    };
  }

  async resolveAlert(id: string): Promise<RetentionAlert | undefined> {
    const updated = await this.prisma.retentionAlert.updateMany({
      where: { id },
      data: {
        status: 'RESUELTA',
        resolvedAt: new Date(),
      },
    });

    if (updated.count === 0) return undefined;
    return this.getAlert(id);
  }

  // Retention
  async getRetentionStatus(): Promise<{
    active: Member[];
    atRisk: Member[];
    inactive: Member[];
    summary: {
      totalClients: number;
      activeCount: number;
      atRiskCount: number;
      inactiveCount: number;
    };
  }> {
    const members = await this.prisma.member.findMany({
      include: { attendance: true },
    });
    const mapped = members.map((member) => this.toMemberDTO(member));

    const active = mapped.filter((member) => member.status === 'active');
    const atRisk = mapped.filter((member) => member.status === 'at-risk');
    const inactive = mapped.filter((member) => member.status === 'inactive');

    return {
      active,
      atRisk,
      inactive,
      summary: {
        totalClients: mapped.length,
        activeCount: active.length,
        atRiskCount: atRisk.length,
        inactiveCount: inactive.length,
      },
    };
  }

  async recalculateRetention(): Promise<{
    message: string;
    updatedCount: number;
    timestamp: string;
  }> {
    const members = await this.prisma.member.findMany({
      include: { attendance: true },
    });
    let updatedCount = 0;

    for (const member of members) {
      const dto = this.toMemberDTO(member);
      const nextStatus = this.calculateStatus(dto.lastCheckIn);
      const churn = this.calculateChurnRisk(dto);

      const status = this.fromClientStatus(nextStatus) ?? 'INACTIVE';
      const risk = this.fromChurnRiskLevel(churn.level) ?? 'BAJO';

      if (
        member.status !== status ||
        member.churnRiskScore !== churn.score ||
        member.churnRiskLevel !== risk
      ) {
        await this.prisma.member.update({
          where: { id: member.id },
          data: {
            status,
            churnRiskScore: churn.score,
            churnRiskLevel: risk,
          },
        });
        updatedCount += 1;
      }
    }

    return {
      message: 'Retention status recalculation completed successfully',
      updatedCount,
      timestamp: new Date().toISOString(),
    };
  }

  async getAtRiskMembers(): Promise<Member[]> {
    const members = await this.prisma.member.findMany({
      where: { status: 'AT_RISK' },
      include: { attendance: true },
    });

    return members.map((member) => this.toMemberDTO(member));
  }

  async getHighRiskMembers(): Promise<Member[]> {
    const members = await this.prisma.member.findMany({
      where: { lastCheckIn: { not: null } },
      include: { attendance: true },
    });

    return members
      .map((member) => this.toMemberDTO(member))
      .filter((member) => {
        const churn = this.calculateChurnRisk(member);
        return churn.level === 'alto' || churn.level === 'critico';
      });
  }

  // Dashboard
  async getDashboardMetrics(): Promise<{
    totalMembers: number;
    activeMembers: number;
    churnRate: number;
    monthlyRevenue: number;
    averageLTV: number;
    occupancyRate: number;
    highRiskMembers: number;
  }> {
    const [totalMembers, activeMembers, highRiskMembers, activeRevenue] =
      await Promise.all([
        this.prisma.member.count(),
        this.prisma.member.count({ where: { membershipStatus: 'ACTIVO' } }),
        this.prisma.member.count({
          where: { OR: [{ churnRiskLevel: 'ALTO' }, { churnRiskLevel: 'CRITICO' }] },
        }),
        this.prisma.member.aggregate({
          where: { membershipStatus: 'ACTIVO' },
          _sum: { monthlyPrice: true },
        }),
      ]);

    const churnRate =
      totalMembers > 0 ? Math.round((highRiskMembers / totalMembers) * 100) : 0;
    const monthlyRevenue = Number(activeRevenue._sum.monthlyPrice ?? 0);
    const averageLTV =
      activeMembers > 0 ? Math.round((monthlyRevenue / activeMembers) * 12) : 0;
    const occupancyRate =
      totalMembers > 0
        ? Math.min(100, Math.round((activeMembers / totalMembers) * 100))
        : 0;

    return {
      totalMembers,
      activeMembers,
      churnRate,
      monthlyRevenue,
      averageLTV,
      occupancyRate,
      highRiskMembers,
    };
  }

  async getChurnDistribution(): Promise<{ name: string; value: number }[]> {
    const [bajo, medio, altoCritico] = await Promise.all([
      this.prisma.member.count({ where: { churnRiskLevel: 'BAJO' } }),
      this.prisma.member.count({ where: { churnRiskLevel: 'MEDIO' } }),
      this.prisma.member.count({
        where: { OR: [{ churnRiskLevel: 'ALTO' }, { churnRiskLevel: 'CRITICO' }] },
      }),
    ]);

    return [
      { name: 'Bajo Riesgo', value: bajo },
      { name: 'Riesgo Medio', value: medio },
      { name: 'Alto/Crítico', value: altoCritico },
    ].filter((entry) => entry.value > 0);
  }

  async getPipelineData(): Promise<{ stage: string; count: number; value: number }[]> {
    const stages: string[] = [
      'NUEVO',
      'CONTACTADO',
      'TOUR_AGENDADO',
      'TOUR_REALIZADO',
      'PROPUESTA',
      'NEGOCIACION',
      'CERRADO_GANADO',
      'CERRADO_PERDIDO',
    ];
    const data: { stage: string; count: number; value: number }[] = [];

    for (const stage of stages) {
      const count = await this.prisma.lead.count({ where: { status: stage } });

      data.push({
        stage: stage.toLowerCase(),
        count,
        value: 0, // Budget field no longer exists
      });
    }

    return data;
  }

  async getMembershipTypes(): Promise<{ type: string; count: number }[]> {
    const types: string[] = ['BASICA', 'PREMIUM', 'VIP', 'ESTUDIANTE'];
    const data: { type: string; count: number }[] = [];

    for (const type of types) {
      const count = await this.prisma.member.count({ where: { membershipType: type } });
      if (count > 0) {
        data.push({ type: this.toMembershipType(type), count });
      }
    }

    return data;
  }

  async getOverview() {
    const [members, leads, equipment, alerts] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.lead.count(),
      this.prisma.equipment.count(),
      this.prisma.retentionAlert.count({ where: { status: { not: 'RESUELTA' } } }),
    ]);

    return { members, leads, equipment, alerts };
  }
}
