import prisma from '../database/prismaClient.js';
import { recordUserAuditLog } from '../auth/auth.service.js';
import { createInviteForUser } from '../auth/auth.service.js';
import { parse } from 'csv-parse/sync';

export async function inviteUser({ institutionId, email, name, role, studentData = null, invitedById = null }) {
  const invite = await createInviteForUser({ email, name, role, institutionId });

  if (role === 'STUDENT' && studentData) {
    const studentNumber = studentData.studentNumber || email;
    const existing = await prisma.student.findFirst({ where: { OR: [{ email }, { studentNumber }] } });
    if (!existing) {
      await prisma.student.create({
        data: {
          studentNumber,
          firstName: studentData.firstName || '',
          lastName: studentData.lastName || '',
          email,
          admissionYear: studentData.admissionYear || new Date().getFullYear(),
          institutionId,
          departmentId: studentData.departmentId || null,
        },
      });
    }
  }

  if (invitedById) {
    await recordUserAuditLog({ userId: invitedById, action: 'invite_user', details: JSON.stringify({ email, role }), performedBy: invitedById });
  }

  return invite;
}

export async function bulkInviteFromCsv({ institutionId, buffer, invitedById = null }) {
  const text = buffer.toString('utf8');
  const rows = parse(text, { columns: true, trim: true });
  const results = [];

  for (const row of rows) {
    const email = (row.email || '').trim();
    if (!email) {
      results.push({ email: null, status: 'skipped', reason: 'missing_email' });
      continue;
    }
    const name = (row.name || `${row.firstName || ''} ${row.lastName || ''}`).trim();
    const role = (row.role || 'STUDENT').toUpperCase();
    const studentData = {
      studentNumber: row.studentNumber || null,
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      admissionYear: row.admissionYear ? Number(row.admissionYear) : undefined,
      departmentId: row.departmentId || null,
    };

    try {
      await inviteUser({ institutionId, email, name, role, studentData, invitedById });
      results.push({ email, status: 'invited' });
    } catch (err) {
      results.push({ email, status: 'error', error: err.message });
    }
  }

  return results;
}
