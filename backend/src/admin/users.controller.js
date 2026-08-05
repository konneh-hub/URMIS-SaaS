import prisma from '../database/prismaClient.js';
import {
  createUserByAdmin,
  resetUserPassword,
  recordUserAuditLog,
} from '../auth/auth.service.js';

function sanitize(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

export async function createUser(req, res, next) {
  try {
    const { email, name, role, institutionId, permissions = [] } = req.body;
    const { user, tempPassword } = await createUserByAdmin({ email, name, role, institutionId, permissions });
    await recordUserAuditLog({ userId: user.id, action: 'create_user', details: JSON.stringify({ email }), performedBy: req.user.id });
    res.status(201).json({ success: true, data: { user, tempPassword } });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      include: { userAssignedRoles: { include: { role: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users.map(sanitize) });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id }, include: { userAssignedRoles: { include: { role: true } } } });
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, institutionId, permissions } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (institutionId !== undefined) data.institutionId = institutionId;
    if (permissions !== undefined) data.permissions = permissions;
    const user = await prisma.user.update({ where: { id }, data });
    await recordUserAuditLog({ userId: id, action: 'update_user', details: JSON.stringify(data), performedBy: req.user.id });
    res.json({ success: true, data: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    await recordUserAuditLog({ userId: id, action: 'delete_user', performedBy: req.user.id });
    res.json({ success: true, data: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function assignRole(req, res, next) {
  try {
    const { id } = req.params; // user id
    const { roleName } = req.body;
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return res.status(400).json({ success: false, message: 'Role not found' });
    await prisma.userAssignedRole.create({ data: { userId: id, roleId: role.id } });
    await recordUserAuditLog({ userId: id, action: 'assign_role', details: roleName, performedBy: req.user.id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function removeRole(req, res, next) {
  try {
    const { id } = req.params;
    const { roleName } = req.body;
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return res.status(400).json({ success: false, message: 'Role not found' });
    await prisma.userAssignedRole.delete({ where: { userId_roleId: { userId: id, roleId: role.id } } });
    await recordUserAuditLog({ userId: id, action: 'remove_role', details: roleName, performedBy: req.user.id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function updatePermissions(req, res, next) {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    const user = await prisma.user.update({ where: { id }, data: { permissions } });
    await recordUserAuditLog({ userId: id, action: 'update_permissions', details: JSON.stringify(permissions), performedBy: req.user.id });
    res.json({ success: true, data: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function setActive(req, res, next) {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const data = { isActive: !!active };
    if (active) data.deletedAt = null;
    const user = await prisma.user.update({ where: { id }, data });
    await recordUserAuditLog({ userId: id, action: active ? 'activate_user' : 'deactivate_user', performedBy: req.user.id });
    res.json({ success: true, data: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { id } = req.params;
    const temp = await resetUserPassword(id);
    await recordUserAuditLog({ userId: id, action: 'reset_password', performedBy: req.user.id });
    res.json({ success: true, tempPassword: temp });
  } catch (err) {
    next(err);
  }
}

export async function getLoginHistory(req, res, next) {
  try {
    const { id } = req.params;
    const items = await prisma.userLoginHistory.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const { id } = req.params;
    const items = await prisma.userAuditLog.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}
