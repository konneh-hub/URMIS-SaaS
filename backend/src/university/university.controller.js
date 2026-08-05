import * as universityService from './university.service.js';

export async function inviteStaffOrStudent(req, res, next) {
  try {
    const { institutionId } = req.params;
    const { email, name, role, studentNumber, firstName, lastName, admissionYear, departmentId } = req.body;
    const studentData = role === 'STUDENT' ? { studentNumber, firstName, lastName, admissionYear, departmentId } : null;
    const result = await universityService.inviteUser({ institutionId, email, name, role, studentData, invitedById: req.user?.id });
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
    const results = await universityService.bulkInviteFromCsv({ institutionId, buffer, invitedById: req.user?.id });
    res.json({ success: true, results });
  } catch (err) {
    next(err);
  }
}
