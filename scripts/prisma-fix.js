import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const generatedClient = path.resolve(root, 'node_modules', '.prisma', 'client');
const prismaClientPackage = path.resolve(root, 'node_modules', '@prisma', 'client');
const prismaClientDotPrisma = path.resolve(prismaClientPackage, '.prisma');
const prismaClientDotPrismaClient = path.resolve(prismaClientDotPrisma, 'client');

if (!fs.existsSync(generatedClient)) {
  console.warn('Prisma generated client not found at:', generatedClient);
  process.exit(0);
}

if (!fs.existsSync(prismaClientPackage)) {
  console.warn('Prisma package not found at:', prismaClientPackage);
  process.exit(0);
}

if (!fs.existsSync(prismaClientDotPrisma)) {
  fs.mkdirSync(prismaClientDotPrisma, { recursive: true });
}

if (fs.existsSync(prismaClientDotPrismaClient)) {
  console.log('Prisma package .prisma/client path already exists.');
  process.exit(0);
}

const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
try {
  fs.symlinkSync(generatedClient, prismaClientDotPrismaClient, symlinkType);
  console.log('Created symlink:', prismaClientDotPrismaClient, '->', generatedClient);
} catch (error) {
  console.warn('Failed to create symlink, falling back to copy:', error.message);
  fs.cpSync(generatedClient, prismaClientDotPrismaClient, { recursive: true });
  console.log('Copied generated Prisma client to:', prismaClientDotPrismaClient);
}
