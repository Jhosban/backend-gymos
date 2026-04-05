import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.attendance.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});

  // Create a sample user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@gymos.com',
      name: 'Admin User',
      password: hashedPassword,
    },
  });

  console.log('✅ User created:', user);

  // Create sample clients
  const now = new Date();
  const client1 = await prisma.client.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      status: 'ACTIVE',
      lastAttendance: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      status: 'AT_RISK',
      lastAttendance: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+1122334455',
      status: 'INACTIVE',
      lastAttendance: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    },
  });

  console.log('✅ Sample clients created');

  // Create sample attendance records
  await prisma.attendance.createMany({
    data: [
      {
        clientId: client1.id,
        attendedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        clientId: client1.id,
        attendedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        clientId: client2.id,
        attendedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        clientId: client3.id,
        attendedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Sample attendance records created');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
