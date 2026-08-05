export default function authorize(allowedRoles = [], requiredPermissions = []) {
  const roleList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const permissionList = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
    if (roleList.length === 0 && permissionList.length === 0) return next();

    const userPermissions = new Set([
      ...(req.user.permissions || []),
      ...(req.user.assignedRoles || []),
    ]);

    const hasRoleAccess = roleList.length === 0 || roleList.includes(req.user.role);
    const hasPermissionAccess = permissionList.length === 0 || permissionList.some((permission) => userPermissions.has(permission));

    if (!hasRoleAccess || !hasPermissionAccess) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return next();
  };
}
