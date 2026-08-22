const normalize = (value) => String(value || '').trim().toUpperCase();

/**
 * Authorization middleware.
 * Backwards compatible with authorize(['ROLE']) and authorize([], ['PERMISSION']).
 * Roles are OR'd with each other; permissions are OR'd with each other.
 * If both are supplied, either a matching role OR a matching permission grants access.
 */
export default function authorize(allowedRoles = [], requiredPermissions = [], options = {}) {
  const roles = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]).filter(Boolean).map(normalize);
  const permissions = (Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]).filter(Boolean).map(normalize);
  const requireAllPermissions = options.requireAllPermissions === true;

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

    if (req.user.role === 'SYSTEM_ADMIN') return next();

    const userRoles = new Set([
      normalize(req.user.role),
      ...(req.user.assignedRoles || []).map(normalize),
    ]);
    const userPermissions = new Set((req.user.permissions || []).map(normalize));

    const roleAllowed = roles.length > 0 && roles.some((role) => userRoles.has(role));
    const permissionAllowed = permissions.length > 0
      && (requireAllPermissions
        ? permissions.every((permission) => userPermissions.has(permission))
        : permissions.some((permission) => userPermissions.has(permission)));

    if (roles.length === 0 && permissions.length === 0) return next();
    if (roleAllowed || permissionAllowed) return next();

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this action',
    });
  };
}
