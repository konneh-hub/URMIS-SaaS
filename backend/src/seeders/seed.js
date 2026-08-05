import prisma from '../database/prismaClient.js';
import { ensureDefaultSystemAdmin } from '../admin/system.service.js';

async function seed() {
  try {
    const result = await ensureDefaultSystemAdmin();
    console.log(result.created ? `Seeded system admin user: ${result.user.email}` : `System admin already exists: ${result.user.email}`);
  } catch (error) {
    console.error('Failed to seed system admin:', error);
    process.exit(1);
  }
}

seed();
