import { validateUser, signAccessToken, signRefreshToken, saveRefreshToken, registerUser, revokeRefreshToken, recordUserLoginHistory, acceptInvite as acceptInviteToken } from './auth.service.js';
import { JWT_REFRESH_EXPIRES, NODE_ENV } from '../config/index.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/index.js';
import prisma from '../database/prismaClient.js';
import { rotateRefreshToken } from './auth.service.js';

function parseDaysFromExpiry(exp) {
  // very small parser: supports formats like '7d' or number of days
  if (!exp) return 7;
  if (typeof exp === 'number') return exp;
  if (exp.endsWith('d')) return Number(exp.slice(0, -1));
  // fallback to days when minutes provided
  return 7;
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await validateUser(email, password);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await saveRefreshToken(user.id, refreshToken);
    await recordUserLoginHistory({
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null,
      success: true,
    });
    const days = parseDaysFromExpiry(JWT_REFRESH_EXPIRES);
    const cookieOptions = {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/api/auth',
      maxAge: days * 24 * 60 * 60 * 1000,
    };
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const { email, password, name, role, institutionId, facultyId, facultyName, departmentId, departmentName, studentNumber, admissionYear, phone, profile } = req.body;
    const user = await registerUser({
      email,
      password,
      name,
      role,
      institutionId,
      facultyId,
      facultyName,
      departmentId,
      departmentName,
      studentNumber,
      admissionYear,
      phone,
      profile,
    });
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await saveRefreshToken(user.id, refreshToken);
    const days = parseDaysFromExpiry(JWT_REFRESH_EXPIRES);
    const cookieOptions = {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/api/auth',
      maxAge: days * 24 * 60 * 60 * 1000,
    };
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.status(201).json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function acceptInvite(req, res, next) {
  try {
    const { token, password } = req.body;
    const user = await acceptInviteToken(token, password);
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    await saveRefreshToken(user.id, refreshToken);
    await recordUserLoginHistory({
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null,
      success: true,
    });
    const days = parseDaysFromExpiry(JWT_REFRESH_EXPIRES);
    const cookieOptions = {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/api/auth',
      maxAge: days * 24 * 60 * 60 * 1000,
    };
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    // clear cookie and optionally revoke DB token if provided in body
    const { refreshToken } = req.body || {};
    if (refreshToken) await revokeRefreshToken(refreshToken);
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
    res.json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfileHandler(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
    const user = await updateProfile(req.user.id, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function changePasswordHandler(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' });
    }
await changePassword(req.user.id, currentPassword, newPassword);
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'Missing refresh token' });
    // ensure token exists in DB
    const rec = await prisma.refreshToken.findUnique({ where: { token } });
    if (!rec) return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      await revokeRefreshToken(token).catch(() => {});
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token subject' });
    // rotate
    const newRefresh = await rotateRefreshToken(token, user.id);
    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const days = parseDaysFromExpiry(JWT_REFRESH_EXPIRES);
    const cookieOptions = {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/api/auth',
      maxAge: days * 24 * 60 * 60 * 1000,
    };
    res.cookie('refreshToken', newRefresh, cookieOptions);
    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
}
