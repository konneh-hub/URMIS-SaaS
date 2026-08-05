import * as userService from './users.service.js';

function sanitize(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

export async function createUser(req, res, next) {
  try {
    const { email, name, role, institutionId, permissions = [] } = req.body;
    const { user, tempPassword } = await userService.createUser({ email, name, role, institutionId, permissions, performedBy: req.user?.id });
    res.status(201).json({ success: true, data: { user, tempPassword } });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await userService.listUsers();
    res.json({ success: true, data: users.map(sanitize) });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, institutionId, permissions } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (institutionId !== undefined) data.institutionId = institutionId;
    if (permissions !== undefined) data.permissions = permissions;
    const user = await userService.updateUser(id, data, req.user?.id);
    res.json({ success: true, data: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.softDeleteUser(id, req.user?.id);
    res.json({ success: true, data: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function assignRole(req, res, next) {
  try {
    const { id } = req.params; // user id
    const { roleName } = req.body;
    await userService.assignRoleToUser(id, roleName, req.user?.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function removeRole(req, res, next) {
  try {
    const { id } = req.params;
    const { roleName } = req.body;
    await userService.removeRoleFromUser(id, roleName, req.user?.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function updatePermissions(req, res, next) {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    const user = await userService.updateUserPermissions(id, permissions, req.user?.id);
    res.json({ success: true, data: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function setActive(req, res, next) {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const user = await userService.setUserActive(id, !!active, req.user?.id);
    res.json({ success: true, data: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { id } = req.params;
    const temp = await userService.resetPasswordForUser(id, req.user?.id);
    res.json({ success: true, tempPassword: temp });
  } catch (err) {
    next(err);
  }
}

export async function getLoginHistory(req, res, next) {
  try {
    const { id } = req.params;
    const items = await userService.getLoginHistory(id);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const { id } = req.params;
    const items = await userService.getAuditLogs(id);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}
