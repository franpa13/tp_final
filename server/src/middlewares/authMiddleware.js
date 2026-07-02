const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

// Middleware para proteger rutas que requieren un usuario autenticado.
function authRequired(req, res, next) {
  try {
    // El frontend debe enviar: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Token requerido");
      error.status = 401;
      return next(error);
    }

    // Extrae el token sin la palabra "Bearer".
    const token = authHeader.split(" ")[1];

    // Verifica firma y expiracion del JWT usando la clave secreta del servidor.
    const decoded = jwt.verify(token, JWT_SECRET);

    // Deja disponible la informacion del token para los siguientes controladores.
    req.user = decoded;

    next();
  } catch (e) {
    // jwt.verify lanza error si el token es invalido, fue alterado o expiro.
    e.status = 401;
    e.message = "Token inválido o expirado";
    next(e);
  }
}

module.exports = authRequired;
