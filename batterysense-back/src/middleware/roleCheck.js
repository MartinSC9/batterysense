const checkRole = (...allowedRoles) => {
  const roles = allowedRoles.flat();

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'No tienes permisos para acceder a este recurso',
        requiredRoles: roles,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

module.exports = checkRole;
