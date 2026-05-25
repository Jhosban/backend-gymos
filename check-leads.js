const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.lead.findMany({ select: { id: true, name: true, productType: true } });
  console.log('Leads:', JSON.stringify(leads, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
