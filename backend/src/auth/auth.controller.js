import jwt from 'jsonwebtoken';
import {
  validateUser,
  signAccessToken,
  signRefreshToken,
  saveRefreshToken,
  registerUser,
  revokeRefreshToken,
  recordUserLoginHistory,
  acceptInvite as acceptInviteToken,
  rotateRefreshToken,
  updateProfile,
  changePassword,
} from './auth.service.js';
import { JWT_REFRESH_EXPIRES, NODE_ENV, JWT_SECRET } from '../config/index.js';
import prisma from '../database/prismaClient.js';

function parseDaysFromExpiry(exp) {
  if (!exp) return 7;
  if (typeof exp === 'number') return exp;
  if (String(exp).endsWith('d')) return Number(String(exp).slice(0, -1)) || 7;
  return 7;
}

function refreshCookieOptions() {
  const days = parseDaysFromExpiry(JWT_REFRESH_EXPIRES);
  return {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: days * 24 * 60 * 60 * 1000,
  };
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, refreshCookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth',
  });
}

async function issueSession(res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await saveRefreshToken(user.id, refreshToken);
  setRefreshCookie(res, refreshToken);
  return accessToken;
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const user = await validateUser(String(email || '').trim().toLowerCase(), password || '');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const accessToken = await issueSession(res, user);
    await recordUserLoginHistory({
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null,
      success: true,
    });

    return res.json({ success: true, data: { user, accessToken } });
  } catch (err) {
    return next(err);
  }
}

export async function register(req, res, next) {
  try {
    const {
      email, password, name, institutionId, facultyId, facultyName, departmentId, departmentName,
      studentNumber, admissionYear, phone, profile, firstName, middleName, lastName, gender, dob,
      nationality, address, profilePhoto, admissionDate, programme, programmeType, level,
      academicSession, studentStatus,
    } = req.body || {};

    if (!email || !password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'A valid email and password of at least 8 characters are required' });
    }

    // Public registration creates students only. Staff/admin accounts must be created by an authorized administrator.
    let profilePhotoPath;
    if (req.body.profilePhotoBase64) {
      try {
        const { saveBase64Image } = await import('../utils/file.js');
        profilePhotoPath = await saveBase64Image(req.body.profilePhotoBase64, 'profile');
      } catch (error) {
        req.log?.warn?.({ err: error }, 'profile image save failed');
      }
    }

    const user = await registerUser({
      email: String(email).trim().toLowerCase(),
      password,
      role: 'STUDENT',
      name,
      institutionId,
      facultyId,
      facultyName,
      departmentId,
      departmentName,
      studentNumber,
      admissionYear,
      phone,
      profile,
      firstName,
      middleName,
      lastName,
      gender,
      dob,
      nationality,
      address,
      profilePhoto: profilePhotoPath || profilePhoto,
      admissionDate,
      programme,
      programmeType,
      level,
      academicSession,
      studentStatus,
    });

    const accessToken = await issueSession(res, user);
    await recordUserLoginHistory({
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null,
      success: true,
    });

    return res.status(201).json({ success: true, data: { user, accessToken } });
  } catch (err) {
    return next(err);
  }
}

export async function acceptInvite(req, res, next) {
  try {
    const { token, password } = req.body || {};
    if (!token || !password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'A valid token and password of at least 8 characters are required' });
    }
    const user = await acceptInviteToken(token, password);
    const accessToken = await issueSession(res, user);
    await recordUserLoginHistory({ userId: user.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] || null, success: true });
    return res.json({ success: true, data: { user, accessToken } });
  } catch (err) {
    return next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) await revokeRefreshToken(token);
    clearRefreshCookie(res);
    return res.json({ success: true, message: 'Signed out successfully' });
  } catch (err) {
    return next(err);
  }
}

export async function me(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
    return res.json({ success: true, data: req.user });
  } catch (err) {
    return next(err);
  }
}

export async function updateProfileHandler(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
    const user = await updateProfile(req.user.id, req.body || {});
    return res.json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
}

export async function changePasswordHandler(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Current password and a new password of at least 8 characters are required' });
    }
    await changePassword(req.user.id, currentPassword, newPassword);
    await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } });
    clearRefreshCookie(res);
    return res.json({ success: true, message: 'Password updated. Please sign in again.' });
  } catch (err) {
    return next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'Refresh session not found' });

    const record = await prisma.refreshToken.findUnique({ where: { token } });
    if (!record) {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: 'Refresh session is invalid' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      await revokeRefreshToken(token).catch(() => {});
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: 'Refresh session has expired' });
    }

    if (payload.type !== 'refresh' || payload.sub !== record.userId) {
      await revokeRefreshToken(token).catch(() => {});
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: 'Invalid refresh session' });
    }

    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user || user.deletedAt || user.isActive === false) {
      await revokeRefreshToken(token).catch(() => {});
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: 'Account is inactive or unavailable' });
    }

    const newRefresh = await rotateRefreshToken(token, user.id);
    const accessToken = signAccessToken(user);
    setRefreshCookie(res, newRefresh);
    return res.json({ success: true, data: { accessToken } });
  } catch (err) {
    return next(err);
  }
}
