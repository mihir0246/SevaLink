// Role-based guard — mirrors OVP's isAuthorizedByRole(["admin"], context)
// Usage: router.post('/assign', auth, requireRole('admin'), handler)
module.exports = function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
};
