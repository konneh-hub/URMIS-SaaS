import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/index.js';
import prisma from '../database/prismaClient.js';

export default async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || req.headers.Authorization;
  const token = header?.startsWith?.('Bearer ') ? header.slice(7) : header;

  if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload?.sub || payload.type === 'refresh') {
      return res.status(401).json({ success: false, message: 'Invalid access token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        assignedRoles: {
          include: { role: { include: { rolePerms: { include: { permission: true } } } } },
        },
      },
    });

    if (!user || user.deletedAt || user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Account is inactive or unavailable' });
    }

    const assignedRoles = user.assignedRoles?.map((entry) => entry.role?.name).filter(Boolean) ?? [];
    const assignedPermissions = user.assignedRoles?.flatMap(
      (entry) => entry.role?.rolePerms?.map((rp) => rp.permission?.name).filter(Boolean) ?? [],
    ) ?? [];
    const directPermissions = Array.isArray(user.permissions) ? user.permissions : [];
    const permissions = [...new Set([...directPermissions, ...assignedPermissions])];

    const student = await prisma.student.findFirst({
      where: { email: user.email },
      select: { id: true, departmentId: true },
    });

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      institutionId: user.institutionId,
      permissions,
      assignedRoles,
      isActive: user.isActive,
      studentId: student?.id ?? null,
      departmentId: student?.departmentId ?? null,
    };

    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired access token' });
  }
}
