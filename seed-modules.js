const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const modulesData = [
    {
      key: 'members',
      name: 'Gestión de Miembros',
      description: 'Administra todos los miembros del gimnasio, sus membresías y información de contacto.',
      price: 29.99,
      icon: 'users',
      isActive: true,
    },
    {
      key: 'checkin',
      name: 'Check-in QR/Huella',
      description: 'Registro de asistencia mediante código QR o reconocimiento biométrico.',
      price: 19.99,
      icon: 'qrcode',
      isActive: true,
    },
    {
      key: 'pipeline',
      name: 'Pipeline de Ventas',
      description: 'Gestiona tu embudo de ventas y seguimiento de prospectos.',
      price: 39.99,
      icon: 'trendingup',
      isActive: true,
    },
    {
      key: 'equipment',
      name: 'Gestión de Equipamiento',
      description: 'Controla el inventario y mantenimiento de equipos del gimnasio.',
      price: 24.99,
      icon: 'wrench',
      isActive: true,
    },
    {
      key: 'employees',
      name: 'Gestión de Empleados',
      description: 'Administra tu equipo de empleados, horarios y nóminas.',
      price: 34.99,
      icon: 'userround',
      isActive: true,
    },
  ];

  for (const m of modulesData) {
    await prisma.module.upsert({
      where: { key: m.key },
      update: m,
      create: m,
    });
  }

  const modules = await prisma.module.findMany();
  console.log('Modules created:', modules.map(m => m.key));

  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 14);

  // Get all gyms
  const gyms = await prisma.gym.findMany();
  console.log('Gyms found:', gyms.length);

  for (const gym of gyms) {
    // Check if gym already has modules
    const existingGM = await prisma.gymModule.findMany({ where: { gymId: gym.id } });
    
    if (existingGM.length === 0) {
      console.log(`Creating modules for gym ${gym.name} with plan ${gym.plan}`);
      
      let modulesToCreate;
      if (gym.plan === 'PRO') {
        modulesToCreate = modules.map(m => m.id);
      } else {
        // BASIC or CUSTOM - only members
        const membersModule = modules.find(m => m.key === 'members');
        modulesToCreate = membersModule ? [membersModule.id] : [];
      }

      for (const moduleId of modulesToCreate) {
        await prisma.gymModule.create({
          data: {
            gymId: gym.id,
            moduleId,
            status: 'TRIAL',
            trialEndsAt: trialEndDate,
          },
        });
      }
    }
  }

  const finalGyms = await prisma.gym.findMany({
    include: { gymModules: { include: { module: true } } }
  });
  console.log('\nFinal gyms with modules:', JSON.stringify(finalGyms, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
