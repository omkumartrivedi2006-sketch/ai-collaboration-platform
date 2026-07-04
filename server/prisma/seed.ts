import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@platform.com',
      password: hashedPassword,
      role: 'Admin',
      phone: '+1234567890',
      department: 'Technology',
      designation: 'IT Systems Admin',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin'
    }
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Manager User',
      email: 'manager@platform.com',
      password: hashedPassword,
      role: 'Manager',
      phone: '+1987654321',
      department: 'Engineering',
      designation: 'Engineering Manager',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Manager'
    }
  });

  const employee = await prisma.user.create({
    data: {
      name: 'Employee User',
      email: 'employee@platform.com',
      password: hashedPassword,
      role: 'Employee',
      phone: '+1122334455',
      department: 'Sales',
      designation: 'Sales Executive',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Employee'
    }
  });

  console.log('Seed success!');
  console.log('Created Users:');
  console.log(`- Admin: ${admin.email} (Password: Password123!)`);
  console.log(`- Manager: ${manager.email} (Password: Password123!)`);
  console.log(`- Employee: ${employee.email} (Password: Password123!)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
