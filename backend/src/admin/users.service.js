import prisma from '../database/prismaClient.js';
import { createUserByAdmin, resetUserPassword, recordUserAuditLog } from '../auth/auth.service.js';

export async function createUser({ email, name, role, institutionId, permissions = [], performedBy }) {
  const { user, tempPassword } = await createUserByAdmin({ email, name, role, institutionId, permissions });
  await recordUserAuditLog({ userId: user.id, action: 'create_user', details: JSON.stringify({ email }), performedBy });
  return { user, tempPassword };
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    include: { userAssignedRoles: { include: { role: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return users;
}

export async function getUserById(id) {
  return prisma.user.findUnique({ where: { id }, include: { userAssignedRoles: { include: { role: true } } } });
}

export async function updateUser(id, data, performedBy) {
  const user = await prisma.user.update({ where: { id }, data });
  await recordUserAuditLog({ userId: id, action: 'update_user', details: JSON.stringify(data), performedBy });
  return user;
}

export async function softDeleteUser(id, performedBy) {
  const user = await prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  await recordUserAuditLog({ userId: id, action: 'delete_user', performedBy });
  return user;
}

export async function assignRoleToUser(userId, roleName, performedBy) {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw Object.assign(new Error('Role not found'), { status: 400 });
  await prisma.userAssignedRole.create({ data: { userId, roleId: role.id } });
  await recordUserAuditLog({ userId, action: 'assign_role', details: roleName, performedBy });
}

export async function removeRoleFromUser(userId, roleName, performedBy) {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw Object.assign(new Error('Role not found'), { status: 400 });
  await prisma.userAssignedRole.delete({ where: { userId_roleId: { userId, roleId: role.id } } });
  await recordUserAuditLog({ userId, action: 'remove_role', details: roleName, performedBy });
}

export async function updateUserPermissions(userId, permissions, performedBy) {
  const user = await prisma.user.update({ where: { id: userId }, data: { permissions } });
  await recordUserAuditLog({ userId, action: 'update_permissions', details: JSON.stringify(permissions), performedBy });
  return user;
}

export async function setUserActive(userId, active, performedBy) {
  const data = { isActive: !!active };
  if (active) data.deletedAt = null;
  const user = await prisma.user.update({ where: { id: userId }, data });
  await recordUserAuditLog({ userId, action: active ? 'activate_user' : 'deactivate_user', performedBy });
  return user;
}

export async function resetPasswordForUser(userId, performedBy) {
  const temp = await resetUserPassword(userId);
  await recordUserAuditLog({ userId, action: 'reset_password', performedBy });
  return temp;
}

export async function getLoginHistory(userId) {
  return prisma.userLoginHistory.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

export async function getAuditLogs(userId) {
  return prisma.userAuditLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}
