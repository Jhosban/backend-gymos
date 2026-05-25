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
  await prisma.gymModule.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.maintenanceRecord.deleteMany({});
  await prisma.retentionAlert.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.equipment.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.gym.deleteMany({});

  // Create default gym
  const gym = await prisma.gym.create({
    data: {
      name: 'Elite Fitness Center',
      slug: 'elite-fitness',
      email: 'admin@elitefitness.com',
      phone: '+57 300 123 4567',
      address: 'Calle 123 #45-67, Bogotá',
    },
  });

  // Seed modules
  const modulesData = [
    {
      key: 'members',
      name: 'Gestión de Miembros',
      description: 'Administra todos los miembros del gimnasio, sus membresías y información de contacto.',
      price: 29.99,
      icon: 'users',
    },
    {
      key: 'checkin',
      name: 'Check-in QR/Huella',
      description: 'Registro de asistencia mediante código QR o reconocimiento biométrico.',
      price: 19.99,
      icon: 'qrcode',
    },
    {
      key: 'pipeline',
      name: 'Pipeline de Ventas',
      description: 'Gestiona tu embudo de ventas y seguimiento de prospectos.',
      price: 39.99,
      icon: 'trendingup',
    },
    {
      key: 'equipment',
      name: 'Gestión de Equipamiento',
      description: 'Controla el inventario y mantenimiento de equipos del gimnasio.',
      price: 24.99,
      icon: 'wrench',
    },
    {
      key: 'employees',
      name: 'Gestión de Empleados',
      description: 'Administra tu equipo de empleados, horarios y nóminas.',
      price: 34.99,
      icon: 'userround',
    },
  ];

  const createdModules = await Promise.all(
    modulesData.map((m) =>
      prisma.module.create({ data: m })
    )
  );

  // Assign all modules to the gym with TRIAL status
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 14);

  for (const mod of createdModules) {
    await prisma.gymModule.create({
      data: {
        gymId: gym.id,
        moduleId: mod.id,
        status: 'TRIAL',
        trialEndsAt: trialEndDate,
      },
    });
  }

  // Create admin user with gym
  const adminPassword = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@gym.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      gymId: gym.id,
    },
  });

  const now = Date.now();

  const carlos = await prisma.member.create({
    data: {
      gymId: gym.id,
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
      gymId: gym.id,
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
        gymId: gym.id,
        name: 'Roberto Gómez',
        email: 'roberto@email.com',
        phone: '+57 305 678 9012',
        source: 'INSTAGRAM',
        status: 'TOUR_AGENDADO',
        assignedAdvisor: 'Asesor María',
        productType: 'MEMBERSHIP',
        productDetails: {
          membershipType: 'premium',
          durationMonths: 3,
          pricePerPeriod: 99000,
          periodicity: 'monthly',
          startDate: '2024-04-01',
          autoRenewal: true,
          includedAccess: ['Gym', 'Piscina', 'Sauna'],
          enrollmentFee: 50000,
        },
        notes: 'Interesado en plan premium. Tour agendado para mañana 5pm.',
      },
      {
        gymId: gym.id,
        name: 'Patricia Ruiz',
        email: 'patricia@email.com',
        phone: '+57 306 789 0123',
        source: 'REFERIDO',
        status: 'PROPUESTA',
        assignedAdvisor: 'Asesor Carlos',
        productType: 'PERSONAL_TRAINING',
        productDetails: {
          serviceType: 'individual',
          numberOfSessions: 12,
          sessionDurationMinutes: 60,
          modality: 'in-person',
          pricePerSession: 65000,
          packagePrice: 720000,
          firstSessionDate: '2024-04-05',
          clientObjective: 'Recuperar tonificación y resistencia',
          initialEvaluationRequired: true,
        },
        notes: 'Referida por miembro actual. Muy interesada.',
      },
      {
        gymId: gym.id,
        name: 'Javier Torres',
        email: 'javier@email.com',
        phone: '+57 307 890 1234',
        source: 'GOOGLE',
        status: 'NEGOCIACION',
        assignedAdvisor: 'Asesor María',
        productType: 'FITNESS_PRODUCT',
        productDetails: {
          productName: 'Mancuernas Ajustables 5-20kg',
          sku: 'ADJ-DUMB-001',
          category: 'equipment',
          quantity: 1,
          unitPrice: 150000,
          size: '5-20kg',
          color: 'Negro',
          availableStock: 5,
          brand: 'PowerFlex',
        },
        notes: 'Comparando con otro gym. Negociando precio.',
      },
      {
        gymId: gym.id,
        name: 'Ana Martínez',
        email: 'ana@email.com',
        phone: '+57 308 901 2345',
        source: 'WALK_IN',
        status: 'NUEVO',
        assignedAdvisor: 'Asesor Juan',
        productType: 'COMBO',
        productDetails: {
          comboType: 'Plan Completo',
          components: [
            {
              type: 'membership',
              description: 'Membresía Premium 6 meses',
              value: 594000,
            },
            {
              type: 'training',
              description: '12 sesiones de entrenamiento personal',
              value: 780000,
            },
          ],
          normalPrice: 1374000,
          discountedPrice: 1100000,
          discountPercentage: 20,
          isRecurring: false,
        },
        notes: 'Interesada en combo completo para comenzar rutina.',
      },
    ],
  });

  const treadmill = await prisma.equipment.create({
    data: {
      gymId: gym.id,
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
