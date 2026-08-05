import * as universityAdminService from './university-admin.service.js';

export async function listUniversityAdmins(req, res, next) {
  try {
    const admins = await universityAdminService.listUniversityAdmins();
    res.json({ success: true, data: admins.map(universityAdminService.sanitizeUser) });
  } catch (err) {
    next(err);
  }
}

export async function createUniversityAdmin(req, res, next) {
  try {
    const { user, tempPassword } = await universityAdminService.createUniversityAdmin(req.body, req.user?.id);
    res.status(201).json({ success: true, data: { user, tempPassword } });
  } catch (err) {
    next(err);
  }
}

export async function updateUniversityAdmin(req, res, next) {
  try {
    const updated = await universityAdminService.updateUniversityAdmin(req.params.userId, req.body, req.user?.id);
    res.json({ success: true, data: universityAdminService.sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}

export async function deleteUniversityAdmin(req, res, next) {
  try {
    await universityAdminService.deleteUniversityAdmin(req.params.userId, req.user?.id);
    res.json({ success: true, message: 'University administrator deleted' });
  } catch (err) {
    next(err);
  }
}

export async function assignInstitution(req, res, next) {
  try {
    const updated = await universityAdminService.assignInstitutionToUser(req.params.userId, req.body.institutionId, req.user?.id);
    res.json({ success: true, data: universityAdminService.sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}

export async function removeInstitution(req, res, next) {
  try {
    const updated = await universityAdminService.removeInstitutionFromUser(req.params.userId, req.user?.id);
    res.json({ success: true, data: universityAdminService.sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}

export async function activateUniversityAdmin(req, res, next) {
  try {
    const updated = await universityAdminService.activateUniversityAdmin(req.params.userId, req.user?.id);
    res.json({ success: true, data: universityAdminService.sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}

export async function deactivateUniversityAdmin(req, res, next) {
  try {
    const updated = await universityAdminService.deactivateUniversityAdmin(req.params.userId, req.user?.id);
    res.json({ success: true, data: universityAdminService.sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}

export async function resetUniversityAdminPassword(req, res, next) {
  try {
    const tempPassword = await universityAdminService.resetUniversityAdminPassword(req.params.userId, req.user?.id);
    res.json({ success: true, data: { tempPassword } });
  } catch (err) {
    next(err);
  }
}

export async function getUniversityAdminLoginHistory(req, res, next) {
  try {
    const history = await universityAdminService.getUniversityAdminLoginHistory(req.params.userId);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function getUniversityAdminAuditLogs(req, res, next) {
  try {
    const logs = await universityAdminService.getUniversityAdminAuditLogs(req.params.userId);
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}

export async function getUniversityAdminProfile(req, res, next) {
  try {
    const user = await universityAdminService.getUniversityAdminProfile(req.params.userId);
    res.json({ success: true, data: universityAdminService.sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function updateUniversityAdminPermissions(req, res, next) {
  try {
    const updated = await universityAdminService.updateUniversityAdminPermissions(req.params.userId, req.body.permissions, req.user?.id);
    res.json({ success: true, data: universityAdminService.sanitizeUser(updated) });
  } catch (err) {
    next(err);
  }
}
