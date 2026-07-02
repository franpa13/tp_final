// Middleware de autorización por rol. Debe usarse siempre DESPUÉS de authRequired,
// ya que depende de req.user (payload del JWT) para conocer el type del usuario.
function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Token requerido');
      error.status = 401;
      return next(error);
    }

    if (!rolesPermitidos.includes(req.user.type)) {
      const error = new Error('No tenés permisos para realizar esta acción');
      error.status = 403;
      return next(error);
    }

    next();
  };
}

module.exports = requireRole;
