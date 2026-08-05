import prisma from '../database/prismaClient.js';
import { recordUserAuditLog } from '../auth/auth.service.js';

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

export async function listStaff(query = {}) {
  const { role, departmentId, facultyId } = query;
  const where = {};
  if (role) where.role = role;
  if (departmentId) where.staffProfile = { departmentId };
  if (facultyId) where.staffProfile = { facultyId };
  const staff = await prisma.user.findMany({ where, include: { staffProfile: true, employmentInformation: true } });
  return staff.map(sanitizeUser);
}

export async function getStaff(id) {
  const staff = await prisma.user.findUnique({ where: { id }, include: { staffProfile: true, employmentInformation: true, assignments: true } });
  return sanitizeUser(staff);
}

export async function createStaff(data, performedBy) {
  const { email, name, role, institutionId, departmentId, facultyId, profile, employment } = data;
  const staff = await prisma.user.create({
    data: {
      email,
      name,
      role,
      institutionId,
      staffProfile: profile ? { create: { ...profile, departmentId, facultyId } } : undefined,
      employmentInformation: employment ? { create: { ...employment, departmentId, facultyId } } : undefined,
    },
    include: { staffProfile: true, employmentInformation: true },
  });
  await recordUserAuditLog({ userId: staff.id, action: 'create_staff', details: staff.id, performedBy });
  return sanitizeUser(staff);
}

export async function updateStaff(id, data, performedBy) {
  const { name, role, institutionId, profile, employment } = data;
  const staff = await prisma.user.update({
    where: { id },
    data: {
      name,
      role,
      institutionId,
      staffProfile: profile ? { upsert: { create: { ...profile }, update: { ...profile } } } : undefined,
      employmentInformation: employment ? { upsert: { create: { ...employment }, update: { ...employment } } } : undefined,
    },
    include: { staffProfile: true, employmentInformation: true },
  });
  await recordUserAuditLog({ userId: id, action: 'update_staff', details: id, performedBy });
  return sanitizeUser(staff);
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
