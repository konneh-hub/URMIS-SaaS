import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/index.js';
import prisma from '../database/prismaClient.js';

export default async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Missing token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });
    req.user = { id: user.id, role: user.role, email: user.email };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}
