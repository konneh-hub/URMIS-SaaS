import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from '../config/index.js';

let prisma;

if (!global.prisma) {
  prisma = new PrismaClient();
  if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
} else {
  prisma = global.prisma;
}

export default prisma;
