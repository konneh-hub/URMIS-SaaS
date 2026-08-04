import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { DATABASE_URL } from '../config/index.js';

let prisma;
const adapter = new PrismaPg({ connectionString: DATABASE_URL });

if (!global.prisma) {
  prisma = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
} else {
  prisma = global.prisma;
}

export default prisma;
