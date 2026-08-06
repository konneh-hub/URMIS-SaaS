import jwt from 'jsonwebtoken';
import prisma from '../database/prismaClient.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { JWT_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES } from '../config/index.js';
import { generateToken, tokenExpiresIn } from '../utils/token.js';

async function resolveInstitutionId(institutionId) {
  if (!institutionId) return null;
  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  return institution ? institution.id : null;
}

async function resolveFacultyId({ facultyId, facultyName, institutionId }) {
  if (facultyId) return facultyId;
  if (!facultyName || !institutionId) return null;
  const faculty = await prisma.faculty.findFirst({
    where: {
      institutionId,
      OR: [{ name: facultyName }, { code: facultyName }],
    },
  });
  return faculty ? faculty.id : null;
}

async function resolveDepartmentId({ departmentId, departmentName, institutionId, facultyId }) {
  if (departmentId) return departmentId;
  if (!institutionId) return null;
  const conditions = [{ name: departmentName }, { code: departmentName }].filter(Boolean);
  if (departmentName) {
    const where = {
      institutionId,
      OR: conditions,
      facultyId: facultyId || undefined,
    };
    const department = await prisma.department.findFirst({ where });
    if (department) return department.id;
  }
  const fallback = await prisma.department.findFirst({ where: { institutionId } });
  return fallback ? fallback.id : null;
}

export async function registerUser({
  email,
  password,
  role = 'STUDENT',
  institutionId = null,
  name = null,
  departmentId = null,
  departmentName = null,
  facultyId = null,
  facultyName = null,
  phone = null,
  studentNumber = null,
  admissionYear = null,
  profile = {},
}) {
  const hashed = await hashPassword(password);
  const normalizedRole = role || 'STUDENT';
  const institution = await resolveInstitutionId(institutionId);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: normalizedRole,
      institutionId: institution,
      name,
      permissions: [],
      isActive: true,
    },
  });

  const parsedName = (name || '').trim().split(/\s+/);
  const firstName = parsedName[0] || '';
  const lastName = parsedName.slice(1).join(' ') || '';
  const resolvedFacultyId = await resolveFacultyId({ facultyId, facultyName, institutionId: institution });
  const resolvedDepartmentId = await resolveDepartmentId({ departmentId, departmentName, institutionId: institution, facultyId: resolvedFacultyId });

  if (normalizedRole === 'STUDENT') {
    if (!institution) {
      throw Object.assign(new Error('Institution not found for registration'), { status: 400 });
    }
    if (!resolvedDepartmentId) {
      throw Object.assign(new Error('Department information is required for student registration'), { status: 400 });
    }
    await prisma.student.create({
      data: {
        studentNumber: studentNumber || `STU-${Date.now()}`,
        firstName,
        lastName,
        email,
        phone,
        admissionYear: admissionYear ? Number(admissionYear) : new Date().getFullYear(),
        institutionId: institution,
        departmentId: resolvedDepartmentId,
        profile: { userId: user.id, ...(profile || {}) },
      },
    });
  }

  if (['LECTURER', 'HOD', 'DEAN', 'EXAM_OFFICER'].includes(normalizedRole)) {
    const profileData = {
      userId: user.id,
      departmentId: resolvedDepartmentId || undefined,
      facultyId: resolvedFacultyId || undefined,
      title: profile.title || normalizedRole,
      bio: profile.bio || undefined,
      employmentDate: profile.employmentDate || undefined,
    };
    await prisma.staffProfile.create({ data: profileData });
    await prisma.employmentInformation.create({
      data: {
        userId: user.id,
        departmentId: resolvedDepartmentId || undefined,
        facultyId: resolvedFacultyId || undefined,
        position: profile.position || normalizedRole,
        rank: profile.rank || undefined,
        contractType: profile.contractType || undefined,
        startDate: profile.startDate ? new Date(profile.startDate) : undefined,
        endDate: profile.endDate ? new Date(profile.endDate) : undefined,
        salary: profile.salary ? Number(profile.salary) : undefined,
      },
    });
  }

  return sanitizeUser(user);
}

export async function validateUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password || user.deletedAt || user.isActive === false) return null;
  const ok = await comparePassword(password, user.password);
  if (!ok) return null;
  return sanitizeUser(user);
}

function sanitizeUser(user) {
  const rest = { ...user };
  delete rest.password;
  return rest;
}

function signToken(payload, expiresIn) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function signAccessToken(user) {
  return signToken({
    sub: user.id,
    role: user.role,
    institutionId: user.institutionId ?? null,
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
  }, JWT_ACCESS_EXPIRES);
}

export function signRefreshToken(userOrId) {
  const sub = typeof userOrId === 'string' ? userOrId : userOrId?.id;
  return signToken({ sub, type: 'refresh' }, JWT_REFRESH_EXPIRES);
}

export async function saveRefreshToken(userId, token) {
  try {
    await prisma.refreshToken.create({ data: { userId, token } });
  } catch {
    // ignore duplicates
  }
}

export async function revokeRefreshToken(token) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function rotateRefreshToken(oldToken, userId) {
  await revokeRefreshToken(oldToken);
  const newToken = signRefreshToken(userId);
  await saveRefreshToken(userId, newToken);
  return newToken;
}

export async function createInviteForUser({ email, name, role, institutionId, permissions = [] }) {
  // create user without password, create invite token
  const user = await prisma.user.create({ data: { email, name, role, institutionId, permissions, isActive: true } });
  const token = generateToken(24);
  const expiresAt = tokenExpiresIn(7);
  await prisma.inviteToken.create({ data: { token, userId: user.id, expiresAt } });
  return { user: sanitizeUser(user), token, expiresAt };
}

export async function acceptInvite(token, password) {
  const record = await prisma.inviteToken.findUnique({ where: { token }, include: { user: true } });
  if (!record) throw Object.assign(new Error('Invalid token'), { status: 400 });
  if (record.used) throw Object.assign(new Error('Token already used'), { status: 400 });
  if (record.expiresAt < new Date()) throw Object.assign(new Error('Token expired'), { status: 400 });
  const hashed = await hashPassword(password);
  await prisma.user.update({ where: { id: record.userId }, data: { password: hashed, isActive: true, deletedAt: null } });
  await prisma.inviteToken.update({ where: { id: record.id }, data: { used: true } });
  return sanitizeUser(record.user);
}

export async function createUserByAdmin({ email, name, role, institutionId, permissions = [], sendInvite = false }) {
  if (sendInvite) {
    const invite = await createInviteForUser({ email, name, role, institutionId, permissions });
    return { user: invite.user, tempPassword: null, inviteToken: invite.token, expiresAt: invite.expiresAt };
  }

  const temp = generateToken(8);
  const hashed = await hashPassword(temp);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      role,
      institutionId,
      permissions,
      password: hashed,
      isActive: true,
    },
  });
  return { user: sanitizeUser(user), tempPassword: temp, inviteToken: null, expiresAt: null };
}

export async function resetUserPassword(userId) {
  const temp = generateToken(8);
  const hashed = await hashPassword(temp);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed, isActive: true, deletedAt: null } });
  return temp;
}

export async function recordUserLoginHistory({ userId, ipAddress, userAgent, success = true, metadata = null }) {
  await prisma.userLoginHistory.create({ data: { userId, ipAddress, userAgent, success, metadata } });
}

export async function recordUserAuditLog({ userId, action, details = null, performedBy = null, metadata = null }) {
  await prisma.userAuditLog.create({ data: { userId, action, details, performedBy, metadata } });
}
