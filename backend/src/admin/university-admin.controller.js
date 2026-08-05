import prisma from '../database/prismaClient.js';
import { createUserByAdmin, resetUserPassword, recordUserAuditLog } from '../auth/auth.service.js';

function sanitizeUser(user) {
  const rest = { ...user };
  delete rest.password;
  return rest;
}

async function ensureInstitutionExists(institutionId) {
  if (!institutionId) return;
  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) throw Object.assign(new Error('Institution not found'), { status: 404 });
}

async function ensureUniversityAdminUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'UNIVERSITY_ADMIN' || user.deletedAt) {
    throw Object.assign(new Error('University administrator not found'), { status: 404 });
  }
  return user;
}

export async function listUniversityAdmins(req, res, next) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'UNIVERSITY_ADMIN', deletedAt: null },
      include: { institution: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: admins.map(sanitizeUser) });
  } catch (err) {
    next(err);
  }
}

export async function createUniversityAdmin(req, res, next) {
  try {
    const { email, name, institutionId, permissions = [] } = req.body;
    await ensureInstitutionExists(institutionId);
    const { user, tempPassword } = await createUserByAdmin({
      email,
      name,
      role: 'UNIVERSITY_ADMIN',
      institutionId,
      permissions,
    });
    await recordUserAuditLog({
      userId: user.id,
      action: 'create_university_admin',
      details: `Created university admin ${email}`,
      performedBy: req.user?.id,
    });
    res.status(201).json({ success: true, data: { user, tempPassword } });
  } catch (err) {
    next(err);
  }
}

export async function updateUniversityAdmin(req, res, next) {
  try {
    const { userId } = req.params;
    const { email, name, institutionId, permissions } = req.body;
    await ensureInstitutionExists(institutionId);
    const user = await ensureUniversityAdminUser(userId);

    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (institutionId !== undefined) updateData.institutionId = institutionId;
    if (permissions !== undefined) updateData.permissions = permissions;

    const updated = await prisma.user.update({ where: { id: user.id }, data: updateData });
    await recordUserAuditLog({
      userId: updated.id,
      action: 'update_university_admin',
      details: `Updated university admin ${updated.email}`,
      performedBy: req.user?.id,
    });
    res.json({ success: true, data: sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}

export async function deleteUniversityAdmin(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await ensureUniversityAdminUser(userId);
    await prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: new Date(), isActive: false },
    });
    await recordUserAuditLog({
      userId: user.id,
      action: 'delete_university_admin',
      details: `Deleted university admin ${user.email}`,
      performedBy: req.user?.id,
    });
    res.json({ success: true, message: 'University administrator deleted' });
  } catch (err) {
    next(err);
  }
}

export async function assignInstitution(req, res, next) {
  try {
    const { userId } = req.params;
    const { institutionId } = req.body;
    await ensureInstitutionExists(institutionId);
    const user = await ensureUniversityAdminUser(userId);
    const updated = await prisma.user.update({ where: { id: user.id }, data: { institutionId } });
    await recordUserAuditLog({
      userId: updated.id,
      action: 'assign_institution',
      details: `Assigned institution ${institutionId}`,
      performedBy: req.user?.id,
    });
    res.json({ success: true, data: sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}

export async function removeInstitution(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await ensureUniversityAdminUser(userId);
    const updated = await prisma.user.update({ where: { id: user.id }, data: { institutionId: null } });
    await recordUserAuditLog({
      userId: updated.id,
      action: 'remove_institution',
      details: 'Removed institution assignment',
      performedBy: req.user?.id,
    });
    res.json({ success: true, data: sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}

export async function activateUniversityAdmin(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await ensureUniversityAdminUser(userId);
    const updated = await prisma.user.update({ where: { id: user.id }, data: { isActive: true } });
    await recordUserAuditLog({
      userId: updated.id,
      action: 'activate_university_admin',
      details: `Activated university admin ${updated.email}`,
      performedBy: req.user?.id,
    });
    res.json({ success: true, data: sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}

export async function deactivateUniversityAdmin(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await ensureUniversityAdminUser(userId);
    const updated = await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });
    await recordUserAuditLog({
      userId: updated.id,
      action: 'deactivate_university_admin',
      details: `Deactivated university admin ${updated.email}`,
      performedBy: req.user?.id,
    });
    res.json({ success: true, data: sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}

export async function resetUniversityAdminPassword(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await ensureUniversityAdminUser(userId);
    const tempPassword = await resetUserPassword(user.id);
    await recordUserAuditLog({
      userId: user.id,
      action: 'reset_university_admin_password',
      details: `Reset password for ${user.email}`,
      performedBy: req.user?.id,
    });
    res.json({ success: true, data: { tempPassword } });
  } catch (err) {
    next(err);
  }
}

export async function getUniversityAdminLoginHistory(req, res, next) {
  try {
    const { userId } = req.params;
    await ensureUniversityAdminUser(userId);
    const history = await prisma.userLoginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function getUniversityAdminAuditLogs(req, res, next) {
  try {
    const { userId } = req.params;
    await ensureUniversityAdminUser(userId);
    const logs = await prisma.userAuditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}

export async function getUniversityAdminProfile(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { institution: true },
    });
    if (!user || user.role !== 'UNIVERSITY_ADMIN' || user.deletedAt) {
      return res.status(404).json({ success: false, message: 'University administrator not found' });
    }
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function updateUniversityAdminPermissions(req, res, next) {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ success: false, message: 'Permissions must be an array' });
    }
    const user = await ensureUniversityAdminUser(userId);
    const updated = await prisma.user.update({ where: { id: user.id }, data: { permissions } });
    await recordUserAuditLog({
      userId: updated.id,
      action: 'update_university_admin_permissions',
      details: `Updated permissions for ${updated.email}`,
      performedBy: req.user?.id,
    });
    res.json({ success: true, data: sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}
