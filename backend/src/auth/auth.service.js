import jwt from 'jsonwebtoken';
import prisma from '../database/prismaClient.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { JWT_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES } from '../config/index.js';
import { generateToken, tokenExpiresIn } from '../utils/token.js';

export async function registerUser({ email, password, role = 'STUDENT', institutionId = null, name = null }) {
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: hashed, role, institutionId, name },
  });
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
  return signToken({ sub: user.id, role: user.role }, JWT_ACCESS_EXPIRES);
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

export async function createInviteForUser({ email, name, role, institutionId }) {
  // create user without password, create invite token
  const user = await prisma.user.create({ data: { email, name, role, institutionId, isActive: true } });
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

export async function createUserByAdmin({ email, name, role, institutionId, permissions = [] }) {
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
  return { user: sanitizeUser(user), tempPassword: temp };
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
