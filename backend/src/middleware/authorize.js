export default function authorize(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
    if (allowedRoles.length === 0) return next();
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
    return next();
  };
}
