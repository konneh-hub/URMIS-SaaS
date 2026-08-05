import prisma from '../database/prismaClient.js';
import { createUserByAdmin } from '../auth/auth.service.js';
import { hashPassword } from '../utils/hash.js';

export async function createInstitution(data) {
  return prisma.institution.create({ data });
}

export async function createSystemAdmin({ email, name, institutionId, permissions = [] }) {
  return createUserByAdmin({ email, name, role: 'SYSTEM_ADMIN', institutionId, permissions });
}

export async function ensureDefaultSystemAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@local.dev';
  const password = process.env.SEED_ADMIN_PASSWORD || 'password123';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { user: existing, created: false };
  }

  const user = await createUserByAdmin({
    email,
    name: 'System Administrator',
    role: 'SYSTEM_ADMIN',
    institutionId: null,
    permissions: ['SYSTEM_ADMIN', 'MANAGE_INSTITUTIONS', 'MANAGE_USERS', 'MANAGE_ROLES', 'VIEW_ANALYTICS'],
  });

  const newPassword = await hashPassword(password);
  const updated = await prisma.user.update({
    where: { id: user.user.id },
    data: { password: newPassword, isActive: true },
  });

  return { user: updated, created: true, tempPassword: password };
}
