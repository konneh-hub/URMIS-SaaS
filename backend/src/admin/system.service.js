import prisma from '../database/prismaClient.js';
import { createUserByAdmin, registerUser } from '../auth/auth.service.js';
import { hashPassword } from '../utils/hash.js';

export async function createInstitution(data) {
  return prisma.institution.create({ data });
}

export async function createSystemAdmin({ email, name, institutionId, permissions = [] }) {
  return createUserByAdmin({ email, name, role: 'SYSTEM_ADMIN', institutionId, permissions });
}

async function ensureInstitution({ name, code, domain }) {
  const existing = await prisma.institution.findUnique({ where: { domain } });
  if (existing) return existing;
  return prisma.institution.create({ data: { name, code, domain, status: 'ACTIVE', subscriptionStatus: 'ACTIVE' } });
}

async function ensureFaculty({ name, code, institutionId }) {
  const existing = await prisma.faculty.findFirst({ where: { code, institutionId } });
  if (existing) return existing;
  return prisma.faculty.create({ data: { name, code, institutionId } });
}

async function ensureDepartment({ name, code, facultyId, institutionId }) {
  const existing = await prisma.department.findFirst({ where: { code, institutionId } });
  if (existing) return existing;
  return prisma.department.create({ data: { name, code, facultyId, institutionId } });
}

async function ensureStudentUser({ email, password, name, institutionId, facultyId, departmentId }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  return registerUser({
    email,
    password,
    name,
    role: 'STUDENT',
    institutionId,
    facultyId,
    departmentId,
    studentNumber: `STU-${Math.floor(Math.random() * 100000)}`,
    admissionYear: new Date().getFullYear(),
  });
}

async function ensureStaffUser({ email, password, name, role, institutionId, permissions = [] }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  const created = await createUserByAdmin({ email, name, role, institutionId, permissions, sendInvite: false });
  const hashed = await hashPassword(password);
  return prisma.user.update({ where: { id: created.user.id }, data: { password: hashed, isActive: true, deletedAt: null } });
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

export async function ensureDefaultDemoUsers() {
  const institution = await ensureInstitution({
    name: 'URMIS Demo University',
    code: 'URMIS',
    domain: 'demo.urmis.local',
  });

  const faculty = await ensureFaculty({ name: 'Engineering', code: 'ENG', institutionId: institution.id });
  const department = await ensureDepartment({ name: 'Computer Science', code: 'CS', facultyId: faculty.id, institutionId: institution.id });

  const users = [
    { email: 'university-admin@local.dev', name: 'Demo University Admin', role: 'UNIVERSITY_ADMIN' },
    { email: 'exam-officer@local.dev', name: 'Demo Examination Officer', role: 'EXAM_OFFICER' },
    { email: 'dean@local.dev', name: 'Demo Dean', role: 'DEAN' },
    { email: 'hod@local.dev', name: 'Demo HOD', role: 'HOD' },
    { email: 'lecturer@local.dev', name: 'Demo Lecturer', role: 'LECTURER' },
  ];

  const password = 'password123';

  for (const item of users) {
    await ensureStaffUser({
      email: item.email,
      password,
      name: item.name,
      role: item.role,
      institutionId: institution.id,
      permissions: [],
    });
  }

  await ensureStudentUser({
    email: 'student@local.dev',
    password,
    name: 'Demo Student',
    institutionId: institution.id,
    facultyId: faculty.id,
    departmentId: department.id,
  });

  return {
    institution,
    faculty,
    department,
    accounts: [
      { email: 'admin@local.dev', password: process.env.SEED_ADMIN_PASSWORD || 'password123', role: 'SYSTEM_ADMIN' },
      { email: 'university-admin@local.dev', password, role: 'UNIVERSITY_ADMIN' },
      { email: 'exam-officer@local.dev', password, role: 'EXAM_OFFICER' },
      { email: 'dean@local.dev', password, role: 'DEAN' },
      { email: 'hod@local.dev', password, role: 'HOD' },
      { email: 'lecturer@local.dev', password, role: 'LECTURER' },
      { email: 'student@local.dev', password, role: 'STUDENT' },
    ],
  };
}
