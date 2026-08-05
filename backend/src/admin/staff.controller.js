import prisma from '../database/prismaClient.js';
import { recordUserAuditLog } from '../auth/auth.service.js';

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

export async function listStaff(req, res, next) {
  try {
    const { role, departmentId, facultyId } = req.query;
    const where = {};
    if (role) where.role = role;
    if (departmentId) where.staffProfile = { departmentId };
    if (facultyId) where.staffProfile = { facultyId };
    const staff = await prisma.user.findMany({
      where,
      include: { staffProfile: true, employmentInformation: true },
    });
    res.json({ success: true, data: staff.map(sanitizeUser) });
  } catch (err) {
    next(err);
  }
}

export async function getStaff(req, res, next) {
  try {
    const { id } = req.params;
    const staff = await prisma.user.findUnique({
      where: { id },
      include: { staffProfile: true, employmentInformation: true, assignments: true },
    });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, data: sanitizeUser(staff) });
  } catch (err) {
    next(err);
  }
}

export async function createStaff(req, res, next) {
  try {
    const { email, name, role, institutionId, departmentId, facultyId, profile, employment } = req.body;
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
    await recordUserAuditLog({ userId: staff.id, action: 'create_staff', details: staff.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: sanitizeUser(staff) });
  } catch (err) {
    next(err);
  }
}

export async function updateStaff(req, res, next) {
  try {
    const { id } = req.params;
    const { name, role, institutionId, profile, employment } = req.body;
    const updateData = { name, role, institutionId };
    const staff = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        staffProfile: profile ? { upsert: { create: { ...profile }, update: { ...profile } } } : undefined,
        employmentInformation: employment
          ? { upsert: { create: { ...employment }, update: { ...employment } } }
          : undefined,
      },
      include: { staffProfile: true, employmentInformation: true },
    });
    await recordUserAuditLog({ userId: id, action: 'update_staff', details: id, performedBy: req.user.id });
    res.json({ success: true, data: sanitizeUser(staff) });
  } catch (err) {
    next(err);
  }
}

export async function deleteStaff(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    await recordUserAuditLog({ userId: id, action: 'delete_staff', details: id, performedBy: req.user.id });
    res.json({ success: true, message: 'Staff deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listStaffAssignments(req, res, next) {
  try {
    const { id } = req.params;
    const assignments = await prisma.staffAssignment.findMany({ where: { staffId: id } });
    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
}

export async function createStaffAssignment(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, courseId, departmentId, facultyId, dueDate, status } = req.body;
    const assignment = await prisma.staffAssignment.create({
      data: {
        title,
        description,
        staffId: id,
        courseId,
        departmentId,
        facultyId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
      },
    });
    await recordUserAuditLog({ userId: id, action: 'create_staff_assignment', details: assignment.id, performedBy: req.user.id });
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

export async function updateStaffAssignment(req, res, next) {
  try {
    const { assignmentId } = req.params;
    const { title, description, courseId, departmentId, facultyId, dueDate, status } = req.body;
    const assignment = await prisma.staffAssignment.update({
      where: { id: assignmentId },
      data: {
        title,
        description,
        courseId,
        departmentId,
        facultyId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
      },
    });
    await recordUserAuditLog({ userId: assignment.staffId, action: 'update_staff_assignment', details: assignmentId, performedBy: req.user.id });
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

export async function deleteStaffAssignment(req, res, next) {
  try {
    const { assignmentId } = req.params;
    await prisma.staffAssignment.delete({ where: { id: assignmentId } });
    await recordUserAuditLog({ userId: req.user.id, action: 'delete_staff_assignment', details: assignmentId, performedBy: req.user.id });
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    next(err);
  }
}
