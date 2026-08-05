import * as staffService from './staff.service.js';

export async function listStaff(req, res, next) {
  try {
    const staff = await staffService.listStaff(req.query);
    res.json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
}

export async function getStaff(req, res, next) {
  try {
    const { id } = req.params;
    const staff = await staffService.getStaff(id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
}

export async function createStaff(req, res, next) {
  try {
    const payload = req.body;
    const staff = await staffService.createStaff(payload, req.user?.id);
    res.status(201).json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
}

export async function updateStaff(req, res, next) {
  try {
    const { id } = req.params;
    const payload = req.body;
    const staff = await staffService.updateStaff(id, payload, req.user?.id);
    res.json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
}

export async function deleteStaff(req, res, next) {
  try {
    const { id } = req.params;
    await staffService.deleteStaff(id, req.user?.id);
    res.json({ success: true, message: 'Staff deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listStaffAssignments(req, res, next) {
  try {
    const { id } = req.params;
    const assignments = await staffService.listStaffAssignments(id);
    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
}

export async function createStaffAssignment(req, res, next) {
  try {
    const { id } = req.params;
    const payload = req.body;
    const assignment = await staffService.createStaffAssignment(id, payload, req.user?.id);
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

export async function updateStaffAssignment(req, res, next) {
  try {
    const { assignmentId } = req.params;
    const payload = req.body;
    const assignment = await staffService.updateStaffAssignment(assignmentId, payload, req.user?.id);
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

export async function deleteStaffAssignment(req, res, next) {
  try {
    const { assignmentId } = req.params;
    await staffService.deleteStaffAssignment(assignmentId, req.user?.id);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    next(err);
  }
}
