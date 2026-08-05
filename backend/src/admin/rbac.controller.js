import * as rbacService from './rbac.service.js';

function sanitizeRole(role) {
  if (!role) return null;
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    permissions: role.rolePerms?.map((rp) => rp.permission) || [],
  };
}

function sanitizePermission(permission) {
  if (!permission) return null;
  return {
    id: permission.id,
    name: permission.name,
    description: permission.description,
    type: permission.type,
    module: permission.module,
    groupId: permission.groupId,
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt,
  };
}

export async function listRoles(req, res, next) {
  try {
    const roles = await rbacService.listRoles();
    res.json({ success: true, data: roles.map(sanitizeRole) });
  } catch (err) {
    next(err);
  }
}

export async function createRole(req, res, next) {
  try {
    const { name, description } = req.body;
    const role = await rbacService.createRole({ name, description, performedBy: req.user?.id });
    res.status(201).json({ success: true, data: sanitizeRole(role) });
  } catch (err) {
    next(err);
  }
}

export async function getRole(req, res, next) {
  try {
    const { roleId } = req.params;
    const role = await rbacService.getRole(roleId);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, data: sanitizeRole(role) });
  } catch (err) {
    next(err);
  }
}

export async function updateRole(req, res, next) {
  try {
    const { roleId } = req.params;
    const { name, description } = req.body;
    const role = await rbacService.updateRole(roleId, { name, description }, req.user?.id);
    res.json({ success: true, data: sanitizeRole(role) });
  } catch (err) {
    next(err);
  }
}

export async function deleteRole(req, res, next) {
  try {
    const { roleId } = req.params;
    await rbacService.deleteRole(roleId, req.user?.id);
    res.json({ success: true, message: 'Role deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listPermissions(req, res, next) {
  try {
    const permissions = await rbacService.listPermissions();
    res.json({ success: true, data: permissions.map(sanitizePermission) });
  } catch (err) {
    next(err);
  }
}

export async function createPermission(req, res, next) {
  try {
    const { name, description, type, module, groupId } = req.body;
    const permission = await rbacService.createPermission({ name, description, type, module, groupId }, req.user?.id);
    res.status(201).json({ success: true, data: sanitizePermission(permission) });
  } catch (err) {
    next(err);
  }
}

export async function getPermission(req, res, next) {
  try {
    const { permissionId } = req.params;
    const permission = await rbacService.getPermission(permissionId);
    if (!permission) return res.status(404).json({ success: false, message: 'Permission not found' });
    res.json({ success: true, data: sanitizePermission(permission) });
  } catch (err) {
    next(err);
  }
}

export async function updatePermission(req, res, next) {
  try {
    const { permissionId } = req.params;
    const { name, description, type, module, groupId } = req.body;
    const permission = await rbacService.updatePermission(permissionId, { name, description, type, module, groupId }, req.user?.id);
    res.json({ success: true, data: sanitizePermission(permission) });
  } catch (err) {
    next(err);
  }
}

export async function deletePermission(req, res, next) {
  try {
    const { permissionId } = req.params;
    await rbacService.deletePermission(permissionId, req.user?.id);
    res.json({ success: true, message: 'Permission deleted' });
  } catch (err) {
    next(err);
  }
}

export async function assignPermissionToRole(req, res, next) {
  try {
    const { roleId } = req.params;
    const { permissionId } = req.body;
    if (!permissionId) return res.status(400).json({ success: false, message: 'permissionId is required' });
    const relation = await rbacService.assignPermissionToRole(roleId, permissionId, req.user?.id);
    res.status(201).json({ success: true, data: relation });
  } catch (err) {
    next(err);
  }
}

export async function removePermissionFromRole(req, res, next) {
  try {
    const { roleId, permissionId } = req.params;
    await rbacService.removePermissionFromRole(roleId, permissionId, req.user?.id);
    res.json({ success: true, message: 'Permission removed from role' });
  } catch (err) {
    next(err);
  }
}

export async function assignRoleToUser(req, res, next) {
  try {
    const { id } = req.params;
    const { roleId } = req.body;
    if (!roleId) return res.status(400).json({ success: false, message: 'roleId is required' });
    const relation = await rbacService.assignRoleToUser(id, roleId, req.user?.id);
    res.status(201).json({ success: true, data: relation });
  } catch (err) {
    next(err);
  }
}

export async function removeRoleFromUser(req, res, next) {
  try {
    const { id, roleId } = req.params;
    await rbacService.removeRoleFromUser(id, roleId, req.user?.id);
    res.json({ success: true, message: 'Role removed from user' });
  } catch (err) {
    next(err);
  }
}

export async function getRoleMatrix(req, res, next) {
  try {
    const roles = await rbacService.getRoleMatrix();
    const matrix = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.rolePerms.map((rp) => rp.permission),
      users: role.userRoles.map((ur) => ur.user),
    }));
    res.json({ success: true, data: matrix });
  } catch (err) {
    next(err);
  }
}
