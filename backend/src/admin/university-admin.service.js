import prisma from '../database/prismaClient.js';
import { createUserByAdmin, resetUserPassword, recordUserAuditLog } from '../auth/auth.service.js';

export function sanitizeUser(user) {
  if (!user) return null;
  const rest = { ...user };
  delete rest.password;
  return rest;
}

export async function ensureInstitutionExists(institutionId) {
  if (!institutionId) return;
  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) {
    const error = new Error('Institution not found');
    error.status = 404;
    throw error;
  }
}

export async function ensureUniversityAdminUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'UNIVERSITY_ADMIN' || user.deletedAt) {
    const error = new Error('University administrator not found');
    error.status = 404;
    throw error;
  }
  return user;
}

export async function listUniversityAdmins() {
  return prisma.user.findMany({
    where: { role: 'UNIVERSITY_ADMIN', deletedAt: null },
    include: { institution: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createUniversityAdmin(data, performedBy) {
  await ensureInstitutionExists(data.institutionId);
  const { user, tempPassword } = await createUserByAdmin({
    email: data.email,
    name: data.name,
    role: 'UNIVERSITY_ADMIN',
    institutionId: data.institutionId,
    permissions: data.permissions || [],
  });
  await recordUserAuditLog({
    userId: user.id,
    action: 'create_university_admin',
    details: `Created university admin ${data.email}`,
    performedBy,
  });
  return { user, tempPassword };
}

export async function updateUniversityAdmin(userId, data, performedBy) {
  if (data.institutionId !== undefined) await ensureInstitutionExists(data.institutionId);
  const user = await ensureUniversityAdminUser(userId);
  const updateData = {};
  if (data.email !== undefined) updateData.email = data.email;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.institutionId !== undefined) updateData.institutionId = data.institutionId;
  if (data.permissions !== undefined) updateData.permissions = data.permissions;

  const updated = await prisma.user.update({ where: { id: user.id }, data: updateData });
  await recordUserAuditLog({
    userId: updated.id,
    action: 'update_university_admin',
    details: `Updated university admin ${updated.email}`,
    performedBy,
  });
  return updated;
}

export async function deleteUniversityAdmin(userId, performedBy) {
  const user = await ensureUniversityAdminUser(userId);
  await prisma.user.update({ where: { id: user.id }, data: { deletedAt: new Date(), isActive: false } });
  await recordUserAuditLog({
    userId: user.id,
    action: 'delete_university_admin',
    details: `Deleted university admin ${user.email}`,
    performedBy,
  });
}

export async function assignInstitutionToUser(userId, institutionId, performedBy) {
  await ensureInstitutionExists(institutionId);
  const user = await ensureUniversityAdminUser(userId);
  const updated = await prisma.user.update({ where: { id: user.id }, data: { institutionId } });
  await recordUserAuditLog({
    userId: updated.id,
    action: 'assign_institution',
    details: `Assigned institution ${institutionId}`,
    performedBy,
  });
  return updated;
}

export async function removeInstitutionFromUser(userId, performedBy) {
  const user = await ensureUniversityAdminUser(userId);
  const updated = await prisma.user.update({ where: { id: user.id }, data: { institutionId: null } });
  await recordUserAuditLog({
    userId: updated.id,
    action: 'remove_institution',
    details: 'Removed institution assignment',
    performedBy,
  });
  return updated;
}

export async function activateUniversityAdmin(userId, performedBy) {
  const user = await ensureUniversityAdminUser(userId);
  const updated = await prisma.user.update({ where: { id: user.id }, data: { isActive: true } });
  await recordUserAuditLog({
    userId: updated.id,
    action: 'activate_university_admin',
    details: `Activated university admin ${updated.email}`,
    performedBy,
  });
  return updated;
}

export async function deactivateUniversityAdmin(userId, performedBy) {
  const user = await ensureUniversityAdminUser(userId);
  const updated = await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });
  await recordUserAuditLog({
    userId: updated.id,
    action: 'deactivate_university_admin',
    details: `Deactivated university admin ${updated.email}`,
    performedBy,
  });
  return updated;
}

export async function resetUniversityAdminPassword(userId, performedBy) {
  const user = await ensureUniversityAdminUser(userId);
  const tempPassword = await resetUserPassword(user.id);
  await recordUserAuditLog({
    userId: user.id,
    action: 'reset_university_admin_password',
    details: `Reset password for ${user.email}`,
    performedBy,
  });
  return tempPassword;
}

export async function getUniversityAdminLoginHistory(userId) {
  await ensureUniversityAdminUser(userId);
  return prisma.userLoginHistory.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

export async function getUniversityAdminAuditLogs(userId) {
  await ensureUniversityAdminUser(userId);
  return prisma.userAuditLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

export async function getUniversityAdminProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { institution: true },
  });
  if (!user || user.role !== 'UNIVERSITY_ADMIN' || user.deletedAt) {
    const error = new Error('University administrator not found');
    error.status = 404;
    throw error;
  }
  return user;
}

export async function updateUniversityAdminPermissions(userId, permissions, performedBy) {
  const user = await ensureUniversityAdminUser(userId);
  const updated = await prisma.user.update({ where: { id: user.id }, data: { permissions } });
  await recordUserAuditLog({
    userId: updated.id,
    action: 'update_university_admin_permissions',
    details: `Updated permissions for ${updated.email}`,
    performedBy,
  });
  return updated;
}
