import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/index.js';
import prisma from '../database/prismaClient.js';

export default async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || req.cookies?.accessToken || req.headers.Authorization;
  const token = header?.startsWith?.('Bearer ') ? header.slice(7) : header;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.type === 'refresh') {
      return res.status(401).json({ success: false, message: 'Invalid token type' });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { assignedRoles: { include: { role: true } } },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const student = await prisma.student.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      institutionId: user.institutionId,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      isActive: user.isActive,
      assignedRoles: user.assignedRoles?.map((entry) => entry.role?.name).filter(Boolean) ?? [],
      studentId: student?.id ?? null,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}
