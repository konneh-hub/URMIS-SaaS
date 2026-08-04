import { createInviteForUser } from '../auth/auth.service.js';
import prisma from '../database/prismaClient.js';
import { parse } from 'csv-parse/sync';

export async function inviteStaffOrStudent(req, res, next) {
  try {
    const { institutionId } = req.params;
    const { email, name, role } = req.body;
    const result = await createInviteForUser({ email, name, role, institutionId });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function bulkUploadUsers(req, res, next) {
  try {
    const { institutionId } = req.params;
    if (!req.file) return res.status(400).json({ success: false, message: 'Missing file' });
    const buffer = req.file.buffer;
    const text = buffer.toString('utf8');
    const records = [];
    csvParse(text, { columns: true, trim: true }, async (err, rows) => {
      if (err) return next(err);
      const results = [];
      for (const row of rows) {
        const email = row.email;
        const name = row.name || `${row.firstName || ''} ${row.lastName || ''}`.trim();
        const role = (row.role || 'STUDENT').toUpperCase();
        try {
          const r = await createInviteForUser({ email, name, role, institutionId });
          // if student, create Student record if fields present
          if (role === 'STUDENT') {
            const studentNumber = row.studentNumber || null;
            const firstName = row.firstName || '';
            const lastName = row.lastName || '';
            const admissionYear = row.admissionYear ? Number(row.admissionYear) : null;
            await prisma.student.create({ data: { studentNumber: studentNumber || email, firstName, lastName, email, admissionYear: admissionYear || new Date().getFullYear(), institutionId, departmentId: row.departmentId || '' } });
          }
          results.push({ email, status: 'invited' });
        } catch (e) {
          results.push({ email, status: 'error', error: e.message });
        }
      }
      res.json({ success: true, results });
    });
  } catch (err) {
    next(err);
  }
}
