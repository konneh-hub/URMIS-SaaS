import prisma from '../database/prismaClient.js';
import { ensureDefaultSystemAdmin, ensureDefaultDemoUsers } from '../admin/system.service.js';

async function seed() {
  try {
    const adminResult = await ensureDefaultSystemAdmin();
    console.log(adminResult.created ? `Seeded system admin user: ${adminResult.user.email}` : `System admin already exists: ${adminResult.user.email}`);

    const demoResult = await ensureDefaultDemoUsers();
    console.log(`Demo accounts seeded: ${demoResult.accounts.map((account) => `${account.role}:${account.email}`).join(', ')}`);
  } catch (error) {
    console.error('Failed to seed demo accounts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
