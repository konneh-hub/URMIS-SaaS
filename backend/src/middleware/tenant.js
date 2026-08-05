export default function requireTenantAccess(req, res, next) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

  const targetInstitutionId = req.params?.institutionId || req.body?.institutionId || req.query?.institutionId;
  if (!targetInstitutionId) return next();

  if (req.user.role === 'SYSTEM_ADMIN') return next();

  const userInstitutionId = req.user.institutionId || req.user.tenantId;
  if (!userInstitutionId) {
    return res.status(403).json({ success: false, message: 'Tenant access not available for this account' });
  }

  if (String(userInstitutionId) !== String(targetInstitutionId)) {
    return res.status(403).json({ success: false, message: 'Forbidden: institution access denied' });
  }

  return next();
}
