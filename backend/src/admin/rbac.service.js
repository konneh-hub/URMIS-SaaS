import prisma from '../database/prismaClient.js';
import { recordUserAuditLog } from '../auth/auth.service.js';

export async function listRoles() {
  return prisma.role.findMany({ include: { rolePerms: { include: { permission: true } } } });
}

export async function createRole({ name, description, performedBy }) {
  const role = await prisma.role.create({ data: { name, description } });
  await recordUserAuditLog({ userId: performedBy, action: 'create_role', details: name, performedBy });
  return role;
}

export async function getRole(roleId) {
  return prisma.role.findUnique({ where: { id: roleId }, include: { rolePerms: { include: { permission: true } } } });
}

export async function updateRole(roleId, { name, description }, performedBy) {
  const role = await prisma.role.update({ where: { id: roleId }, data: { name, description } });
  await recordUserAuditLog({ userId: performedBy, action: 'update_role', details: roleId, performedBy });
  return role;
}

export async function deleteRole(roleId, performedBy) {
  await prisma.role.delete({ where: { id: roleId } });
  await recordUserAuditLog({ userId: performedBy, action: 'delete_role', details: roleId, performedBy });
}

export async function listPermissions() {
  return prisma.permission.findMany();
}

export async function createPermission(data, performedBy) {
  const permission = await prisma.permission.create({ data });
  await recordUserAuditLog({ userId: performedBy, action: 'create_permission', details: data.name, performedBy });
  return permission;
}

export async function getPermission(permissionId) {
  return prisma.permission.findUnique({ where: { id: permissionId } });
}

export async function updatePermission(permissionId, data, performedBy) {
  const permission = await prisma.permission.update({ where: { id: permissionId }, data });
  await recordUserAuditLog({ userId: performedBy, action: 'update_permission', details: permissionId, performedBy });
  return permission;
}

export async function deletePermission(permissionId, performedBy) {
  await prisma.permission.delete({ where: { id: permissionId } });
  await recordUserAuditLog({ userId: performedBy, action: 'delete_permission', details: permissionId, performedBy });
}

export async function assignPermissionToRole(roleId, permissionId, performedBy) {
  const relation = await prisma.rolePermission.create({ data: { roleId, permissionId } });
  await recordUserAuditLog({ userId: performedBy, action: 'assign_permission', details: `role=${roleId} permission=${permissionId}`, performedBy });
  return relation;
}

export async function removePermissionFromRole(roleId, permissionId, performedBy) {
  await prisma.rolePermission.delete({ where: { roleId_permissionId: { roleId, permissionId } } });
  await recordUserAuditLog({ userId: performedBy, action: 'remove_permission', details: `role=${roleId} permission=${permissionId}`, performedBy });
}

export async function assignRoleToUser(userId, roleId, performedBy) {
  const relation = await prisma.userAssignedRole.create({ data: { userId, roleId } });
  await recordUserAuditLog({ userId, action: 'assign_role', details: roleId, performedBy });
  return relation;
}

export async function removeRoleFromUser(userId, roleId, performedBy) {
  await prisma.userAssignedRole.delete({ where: { userId_roleId: { userId, roleId } } });
  await recordUserAuditLog({ userId, action: 'remove_role', details: roleId, performedBy });
}

export async function getRoleMatrix() {
  return prisma.role.findMany({ include: { rolePerms: { include: { permission: true } }, userRoles: { include: { user: true } } } });
}
