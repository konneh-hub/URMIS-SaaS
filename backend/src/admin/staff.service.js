import prisma from '../database/prismaClient.js';
import { createUserByAdmin, recordUserAuditLog } from '../auth/auth.service.js';

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

export async function listStaff(query = {}) {
  const { role, departmentId, facultyId } = query;
  const where = {};
  if (role) where.role = role;
  const staff = await prisma.user.findMany({ where });
  return staff.map(sanitizeUser);
}

export async function getStaff(id) {
  const staff = await prisma.user.findUnique({ where: { id } });
  return sanitizeUser(staff);
}

export async function createStaff(data, performedBy) {
  const { email, name, role, institutionId: explicitInstitutionId, departmentId, facultyId, profile, employment, title, firstName, lastName, phone } = data;
  const actorInstitutionId = performedBy
    ? (await prisma.user.findUnique({ where: { id: performedBy }, select: { institutionId: true } }))?.institutionId
    : null;
  const resolvedInstitutionId = explicitInstitutionId || actorInstitutionId || (await prisma.institution.findFirst({ select: { id: true } }))?.id;
  const resolvedName = name || [firstName, lastName].filter(Boolean).join(' ').trim();
  const normalizedRole = role || (title?.toUpperCase?.() === 'HOD' ? 'HOD' : title?.toUpperCase?.() === 'DEAN' ? 'DEAN' : title?.toUpperCase?.() === 'EXAM_OFFICER' ? 'EXAM_OFFICER' : 'LECTURER');
  const profilePayload = { ...(profile || {}) };
  if (title && !profilePayload.title) profilePayload.title = title;
  if (departmentId && !profilePayload.departmentId) profilePayload.departmentId = departmentId;
  if (facultyId && !profilePayload.facultyId) profilePayload.facultyId = facultyId;
  if (firstName && !profilePayload.firstName) profilePayload.firstName = firstName;
  if (lastName && !profilePayload.lastName) profilePayload.lastName = lastName;
  if (phone && !profilePayload.phone) profilePayload.phone = phone;

  const employmentPayload = employment ? { ...employment } : null;
  if (departmentId && employmentPayload && !employmentPayload.departmentId) employmentPayload.departmentId = departmentId;
  if (facultyId && employmentPayload && !employmentPayload.facultyId) employmentPayload.facultyId = facultyId;

  const { user, tempPassword, inviteToken, expiresAt } = await createUserByAdmin({
    email,
    name: resolvedName,
    role: normalizedRole,
    institutionId: resolvedInstitutionId,
    permissions: [],
    sendInvite: true,
  });

  const staff = await prisma.user.update({
    where: { id: user.id },
    data: {
      role: normalizedRole,
      institutionId: resolvedInstitutionId,
      permissions: Object.keys(profilePayload).length > 0 || departmentId || facultyId ? [...(user.permissions || []), 'PROFILE_SET'] : user.permissions || [],
    },
  });

  if (employmentPayload) {
    try {
      await prisma.employmentInformation.upsert({
        where: { userId: staff.id },
        create: { userId: staff.id, ...employmentPayload, departmentId: employmentPayload.departmentId || undefined, facultyId: employmentPayload.facultyId || undefined, position: employmentPayload.position || title || normalizedRole },
        update: { ...employmentPayload, departmentId: employmentPayload.departmentId || undefined, facultyId: employmentPayload.facultyId || undefined, position: employmentPayload.position || title || normalizedRole },
      });
    } catch (error) {
      // Ignore unsupported profile tables in older databases
    }
  }

  if (Object.keys(profilePayload).length > 0 || departmentId || facultyId) {
    try {
      await prisma.staffProfile.upsert({
        where: { userId: staff.id },
        create: { userId: staff.id, ...profilePayload, departmentId: departmentId || profilePayload.departmentId || undefined, facultyId: facultyId || profilePayload.facultyId || undefined, title: profilePayload.title || title || undefined },
        update: { ...profilePayload, departmentId: departmentId || profilePayload.departmentId || undefined, facultyId: facultyId || profilePayload.facultyId || undefined, title: profilePayload.title || title || undefined },
      });
    } catch (error) {
      // Ignore unsupported profile tables in older databases
    }
  }

  const staffWithRelations = await prisma.user.findUnique({ where: { id: staff.id } });

  await recordUserAuditLog({ userId: staffWithRelations.id, action: 'create_staff', details: staffWithRelations.id, performedBy });
  return { ...sanitizeUser(staffWithRelations), tempPassword, inviteToken, expiresAt };
}

export async function updateStaff(id, data, performedBy) {
  const { name, role, institutionId, profile, employment } = data;
  await prisma.user.update({
    where: { id },
    data: {
      name,
      role,
      institution: institutionId ? { connect: { id: institutionId } } : undefined,
    },
  });

  if (profile) {
    await prisma.user.update({
      where: { id },
      data: {
        permissions: [...(updatedStaff?.permissions || []), 'PROFILE_SET'],
      },
    });
  }

  if (employment) {
    await prisma.user.update({
      where: { id },
      data: {
        permissions: [...(updatedStaff?.permissions || []), 'EMPLOYMENT_SET'],
      },
    });
  }

  const updatedStaff = await prisma.user.findUnique({ where: { id } });
  await recordUserAuditLog({ userId: id, action: 'update_staff', details: id, performedBy });
  return sanitizeUser(updatedStaff);
}

export async function deleteStaff(id, performedBy) {
  await prisma.user.delete({ where: { id } });
  await recordUserAuditLog({ userId: id, action: 'delete_staff', details: id, performedBy });
}

export async function listStaffAssignments(staffId) {
  return prisma.staffAssignment.findMany({ where: { staffId } });
}

export async function createStaffAssignment(staffId, data, performedBy) {
  const { title, description, courseId, departmentId, facultyId, dueDate, status } = data;
  const assignment = await prisma.staffAssignment.create({ data: { title, description, staffId, courseId, departmentId, facultyId, dueDate: dueDate ? new Date(dueDate) : undefined, status } });
  await recordUserAuditLog({ userId: staffId, action: 'create_staff_assignment', details: assignment.id, performedBy });
  return assignment;
}

export async function updateStaffAssignment(assignmentId, data, performedBy) {
  const { title, description, courseId, departmentId, facultyId, dueDate, status } = data;
  const assignment = await prisma.staffAssignment.update({ where: { id: assignmentId }, data: { title, description, courseId, departmentId, facultyId, dueDate: dueDate ? new Date(dueDate) : undefined, status } });
  await recordUserAuditLog({ userId: assignment.staffId, action: 'update_staff_assignment', details: assignmentId, performedBy });
  return assignment;
}

export async function deleteStaffAssignment(assignmentId, performedBy) {
  await prisma.staffAssignment.delete({ where: { id: assignmentId } });
  await recordUserAuditLog({ userId: performedBy, action: 'delete_staff_assignment', details: assignmentId, performedBy });
}
