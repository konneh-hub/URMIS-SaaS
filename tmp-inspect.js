import prisma from './backend/src/database/prismaClient.js';
const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
console.log(JSON.stringify(result, null, 2));
