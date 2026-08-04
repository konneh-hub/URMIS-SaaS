import prisma from '../database/prismaClient.js';
import { createUserByAdmin } from '../auth/auth.service.js';

export async function createInstitution(req, res, next) {
  try {
    const { name, code, domain, address, phone, email } = req.body;
    const inst = await prisma.institution.create({ data: { name, code, domain, address, phone, email } });
    res.status(201).json({ success: true, data: inst });
  } catch (err) {
    next(err);
  }
}

export async function createSystemAdmin(req, res, next) {
  try {
    const { email, name } = req.body;
    const { user, tempPassword } = await createUserByAdmin({ email, name, role: 'SYSTEM_ADMIN' });
    res.status(201).json({ success: true, data: { user, tempPassword } });
  } catch (err) {
    next(err);
  }
}
