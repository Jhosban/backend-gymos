const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const modules = await prisma.module.findMany();
  console.log('Modules:', JSON.stringify(modules, null, 2));

  const gyms = await prisma.gym.findMany({
    include: { gymModules: { include: { module: true } } }
  });
  console.log('\nGyms with modules:', JSON.stringify(gyms, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
