import prisma from '../database/prismaClient.js';
import { recordUserAuditLog } from '../auth/auth.service.js';

function sanitizeRole(role) {
  if (!role) return null;
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    permissions: role.rolePerms?.map((rp) => rp.permission) || [],
  };
}

function sanitizePermission(permission) {
  if (!permission) return null;
  return {
    id: permission.id,
    name: permission.name,
    description: permission.description,
    type: permission.type,
    module: permission.module,
    groupId: permission.groupId,
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt,
  };
}

export async function listRoles(req, res, next) {
  try {
    const roles = await prisma.role.findMany({ include: { rolePerms: { include: { permission: true } } } });
    res.json({ success: true, data: roles.map(sanitizeRole) });
  } catch (err) {
    next(err);
  }
}

export async function createRole(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Role name is required' });
    const role = await prisma.role.create({ data: { name, description } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_role', details: name, performedBy: req.user.id });
    res.status(201).json({ success: true, data: sanitizeRole(role) });
  } catch (err) {
    next(err);
  }
}

export async function getRole(req, res, next) {
  try {
    const { roleId } = req.params;
    const role = await prisma.role.findUnique({ where: { id: roleId }, include: { rolePerms: { include: { permission: true } } } });
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, data: sanitizeRole(role) });
  } catch (err) {
    next(err);
  }
}

export async function updateRole(req, res, next) {
  try {
    const { roleId } = req.params;
    const { name, description } = req.body;
    const role = await prisma.role.update({ where: { id: roleId }, data: { name, description } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_role', details: roleId, performedBy: req.user.id });
    res.json({ success: true, data: sanitizeRole(role) });
  } catch (err) {
    next(err);
  }
}

export async function deleteRole(req, res, next) {
  try {
    const { roleId } = req.params;
    await prisma.role.delete({ where: { id: roleId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_role', details: roleId, performedBy: req.user.id });
    res.json({ success: true, message: 'Role deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listPermissions(req, res, next) {
  try {
    const permissions = await prisma.permission.findMany();
    res.json({ success: true, data: permissions.map(sanitizePermission) });
  } catch (err) {
    next(err);
  }
}

export async function createPermission(req, res, next) {
  try {
    const { name, description, type, module, groupId } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Permission name is required' });
    const permission = await prisma.permission.create({ data: { name, description, type, module, groupId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'create_permission', details: name, performedBy: req.user.id });
    res.status(201).json({ success: true, data: sanitizePermission(permission) });
  } catch (err) {
    next(err);
  }
}

export async function getPermission(req, res, next) {
  try {
    const { permissionId } = req.params;
    const permission = await prisma.permission.findUnique({ where: { id: permissionId } });
    if (!permission) return res.status(404).json({ success: false, message: 'Permission not found' });
    res.json({ success: true, data: sanitizePermission(permission) });
  } catch (err) {
    next(err);
  }
}

export async function updatePermission(req, res, next) {
  try {
    const { permissionId } = req.params;
    const { name, description, type, module, groupId } = req.body;
    const permission = await prisma.permission.update({ where: { id: permissionId }, data: { name, description, type, module, groupId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'update_permission', details: permissionId, performedBy: req.user.id });
    res.json({ success: true, data: sanitizePermission(permission) });
  } catch (err) {
    next(err);
  }
}

export async function deletePermission(req, res, next) {
  try {
    const { permissionId } = req.params;
    await prisma.permission.delete({ where: { id: permissionId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_permission', details: permissionId, performedBy: req.user.id });
    res.json({ success: true, message: 'Permission deleted' });
  } catch (err) {
    next(err);
  }
}

export async function assignPermissionToRole(req, res, next) {
  try {
    const { roleId } = req.params;
    const { permissionId } = req.body;
    if (!permissionId) return res.status(400).json({ success: false, message: 'permissionId is required' });
    const relation = await prisma.rolePermission.create({ data: { roleId, permissionId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'assign_permission', details: `role=${roleId} permission=${permissionId}`, performedBy: req.user.id });
    res.status(201).json({ success: true, data: relation });
  } catch (err) {
    next(err);
  }
}

export async function removePermissionFromRole(req, res, next) {
  try {
    const { roleId, permissionId } = req.params;
    await prisma.rolePermission.delete({ where: { roleId_permissionId: { roleId, permissionId } } });
    await recordUserAuditLog({ userId: req.user.id, action: 'remove_permission', details: `role=${roleId} permission=${permissionId}`, performedBy: req.user.id });
    res.json({ success: true, message: 'Permission removed from role' });
  } catch (err) {
    next(err);
  }
}

export async function assignRoleToUser(req, res, next) {
  try {
    const { id } = req.params;
    const { roleId } = req.body;
    if (!roleId) return res.status(400).json({ success: false, message: 'roleId is required' });
    const relation = await prisma.userAssignedRole.create({ data: { userId: id, roleId } });
    await recordUserAuditLog({ userId: id, action: 'assign_role', details: roleId, performedBy: req.user.id });
    res.status(201).json({ success: true, data: relation });
  } catch (err) {
    next(err);
  }
}

export async function removeRoleFromUser(req, res, next) {
  try {
    const { id, roleId } = req.params;
    await prisma.userAssignedRole.delete({ where: { userId_roleId: { userId: id, roleId } } });
    await recordUserAuditLog({ userId: id, action: 'remove_role', details: roleId, performedBy: req.user.id });
    res.json({ success: true, message: 'Role removed from user' });
  } catch (err) {
    next(err);
  }
}

export async function getRoleMatrix(req, res, next) {
  try {
    const roles = await prisma.role.findMany({ include: { rolePerms: { include: { permission: true } }, userRoles: { include: { user: true } } } });
    const matrix = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.rolePerms.map((rp) => rp.permission),
      users: role.userRoles.map((ur) => ur.user),
    }));
    res.json({ success: true, data: matrix });
  } catch (err) {
    next(err);
  }
}
