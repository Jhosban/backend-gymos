/**
 * Prisma Seed Script for GymOS Backend
 * 
 * This script initializes the database with sample data for development.
 * 
 * Default Admin User Credentials:
 *   Email: admin@gym.com
 *   Password: password123
 * 
 * WARNING: Change these credentials in production!
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.maintenanceRecord.deleteMany({});
  await prisma.retentionAlert.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.equipment.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPassword = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@gym.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const now = Date.now();

  const carlos = await prisma.member.create({
    data: {
      name: 'Carlos Rodriguez',
      email: 'carlos@email.com',
      phone: '+57 300 123 4567',
      birthDate: new Date('1990-05-15T00:00:00Z'),
      gender: 'M',
      goal: 'GANAR_MUSCULO',
      experienceLevel: 'INTERMEDIO',
      membershipType: 'PREMIUM',
      joinedAt: new Date('2024-01-10T00:00:00Z'),
      membershipEnd: new Date('2025-01-10T00:00:00Z'),
      monthlyPrice: 120000,
      membershipStatus: 'ACTIVO',
      status: 'ACTIVE',
      lastCheckIn: new Date(now - 2 * 24 * 60 * 60 * 1000),
      checkInsLast30Days: 12,
      averageCheckInsPerWeek: 3.5,
      preferredSchedule: 'TARDE',
      churnRiskScore: 15,
      churnRiskLevel: 'BAJO',
      acquisitionSource: 'INSTAGRAM',
      assignedTrainer: 'Entrenador Juan',
      notes: 'Muy comprometido, objetivo: ganar 5kg de musculo',
    },
  });

  const maria = await prisma.member.create({
    data: {
      name: 'Maria Lopez',
      email: 'maria@email.com',
      phone: '+57 301 234 5678',
      birthDate: new Date('1985-08-22T00:00:00Z'),
      gender: 'F',
      goal: 'PERDER_PESO',
      experienceLevel: 'PRINCIPIANTE',
      membershipType: 'BASICA',
      joinedAt: new Date('2024-02-15T00:00:00Z'),
      membershipEnd: new Date('2025-02-15T00:00:00Z'),
      monthlyPrice: 80000,
      membershipStatus: 'ACTIVO',
      status: 'AT_RISK',
      lastCheckIn: new Date(now - 9 * 24 * 60 * 60 * 1000),
      checkInsLast30Days: 4,
      averageCheckInsPerWeek: 1.2,
      preferredSchedule: 'MANANA',
      churnRiskScore: 72,
      churnRiskLevel: 'ALTO',
      acquisitionSource: 'GOOGLE',
      assignedTrainer: 'Entrenadora Ana',
      notes: 'Ha faltado mucho ultimamente. Posible riesgo de abandono.',
    },
  });

  await prisma.attendance.createMany({
    data: [
      {
        memberId: carlos.id,
        attendedAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
        duration: 60,
        activities: JSON.stringify(['pesas', 'cardio']),
      },
      {
        memberId: carlos.id,
        attendedAt: new Date(now - 6 * 24 * 60 * 60 * 1000),
        duration: 45,
        activities: JSON.stringify(['pesas']),
      },
      {
        memberId: maria.id,
        attendedAt: new Date(now - 9 * 24 * 60 * 60 * 1000),
        duration: 60,
        activities: JSON.stringify(['cardio']),
      },
    ],
  });

  await prisma.lead.createMany({
    data: [
      {
        name: 'Roberto Gomez',
        email: 'roberto@email.com',
        phone: '+57 305 678 9012',
        fitnessGoal: 'Perder 10kg en 3 meses',
        budget: 100000,
        source: 'INSTAGRAM',
        status: 'TOUR_AGENDADO',
        assignedAdvisor: 'Asesor Maria',
        conversionProbability: 65,
        notes: 'Interesado en plan premium.',
      },
      {
        name: 'Patricia Ruiz',
        email: 'patricia@email.com',
        phone: '+57 306 789 0123',
        fitnessGoal: 'Tonificar',
        budget: 80000,
        source: 'REFERIDO',
        status: 'PROPUESTA',
        assignedAdvisor: 'Asesor Carlos',
        conversionProbability: 80,
      },
    ],
  });

  const treadmill = await prisma.equipment.create({
    data: {
      name: 'Cinta de Correr Pro',
      category: 'CARDIO',
      brand: 'Technogym',
      model: 'Run 500',
      serialNumber: 'TG-2024-001',
      purchaseDate: new Date('2023-06-15T00:00:00Z'),
      warrantyEnd: new Date('2025-06-15T00:00:00Z'),
      price: 8500000,
      status: 'OPERATIVO',
      location: 'Zona Cardio',
      lastMaintenance: new Date(now - 15 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(now + 15 * 24 * 60 * 60 * 1000),
      maintenanceIntervalDays: 30,
      totalUsageHours: 450,
      notes: 'Mantenimiento mensual programado',
    },
  });

  await prisma.maintenanceRecord.create({
    data: {
      equipmentId: treadmill.id,
      type: 'PREVENTIVO',
      description: 'Mantenimiento preventivo mensual',
      technician: 'Tecnico Juan Perez',
      cost: 150000,
      scheduledDate: new Date(now + 15 * 24 * 60 * 60 * 1000),
      status: 'PENDIENTE',
    },
  });

  await prisma.retentionAlert.createMany({
    data: [
      {
        clientId: maria.id,
        clientName: 'Maria Lopez',
        type: 'AUSENCIA_PROLONGADA',
        severity: 'CRITICA',
        description: 'No ha asistido en 9 dias.',
        daysSinceLastVisit: 9,
        recommendedAction: 'Llamada urgente y sesion de re-engagement.',
        status: 'PENDIENTE',
      },
      {
        clientId: carlos.id,
        clientName: 'Carlos Rodriguez',
        type: 'MILESTONE_ALCANZADO',
        severity: 'INFORMATIVA',
        description: 'Mantiene alta frecuencia de asistencia.',
        daysSinceLastVisit: 2,
        recommendedAction: 'Reconocer progreso y mantener plan.',
        status: 'PENDIENTE',
      },
    ],
  });

  console.log('✅ Seed completa con datos de prueba');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
