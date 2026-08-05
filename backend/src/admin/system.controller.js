import * as systemService from './system.service.js';

export async function createInstitution(req, res, next) {
  try {
    const inst = await systemService.createInstitution(req.body);
    res.status(201).json({ success: true, data: inst });
  } catch (err) {
    next(err);
  }
}

export async function createSystemAdmin(req, res, next) {
  try {
    const { email, name, institutionId, permissions } = req.body;
    const { user, tempPassword } = await systemService.createSystemAdmin({ email, name, institutionId, permissions });
    res.status(201).json({ success: true, data: { user, tempPassword } });
  } catch (err) {
    next(err);
  }
}
